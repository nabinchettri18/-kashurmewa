import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedFulfillmentStatuses = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);

async function getAdminContext(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { response: NextResponse.json({ error: "Sign in with an authorized store-admin account." }, { status: 401 }) };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { response: NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 }) };
  if (data.user.app_metadata?.role !== "admin") {
    return { response: NextResponse.json({ error: "This account does not have store-admin permission." }, { status: 403 }) };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { response: NextResponse.json({ error: "Admin database access is not configured. Set the server-only SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 }) };
  }

  return {
    user: data.user,
    db: createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }),
  };
}

export async function GET(request: Request) {
  const context = await getAdminContext(request);
  if ("response" in context) return context.response;

  const [productResult, ordersResult] = await Promise.all([
    context.db
      .from("km_products")
      .select("id,name,slug,active,description,km_product_variants(id,size,price_inr,stock,sku,active)")
      .eq("slug", "kashmiri-walnuts")
      .maybeSingle(),
    context.db.from("km_orders").select("*").order("created_at", { ascending: false }).limit(200),
  ]);

  if (productResult.error || ordersResult.error) {
    console.error("Admin data query failed:", productResult.error?.message, ordersResult.error?.message);
    return NextResponse.json({ error: "Could not load store data. Please retry." }, { status: 503 });
  }

  const rawProduct = productResult.data;
  const product = rawProduct
    ? {
        ...rawProduct,
        variants: [...(rawProduct.km_product_variants || [])].sort((a, b) => a.price_inr - b.price_inr),
      }
    : null;

  return NextResponse.json({ product, orders: ordersResult.data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const context = await getAdminContext(request);
  if ("response" in context) return context.response;

  try {
    const body = await request.json();

    if (body.action === "variant") {
      if (typeof body.id !== "string" || !uuidPattern.test(body.id)) {
        return NextResponse.json({ error: "Invalid product variant." }, { status: 400 });
      }
      if (body.field !== "price_inr" && body.field !== "stock") {
        return NextResponse.json({ error: "Only price and stock can be updated here." }, { status: 400 });
      }
      const value = Number(body.value);
      if (!Number.isInteger(value) || value < 0 || (body.field === "price_inr" && value === 0)) {
        return NextResponse.json({ error: "Enter a valid non-negative whole number; price must be above zero." }, { status: 400 });
      }
      const { error } = await context.db.from("km_product_variants").update({ [body.field]: value }).eq("id", body.id);
      if (error) {
        console.error("Admin variant update failed:", error.message);
        return NextResponse.json({ error: "Could not save that product change." }, { status: 503 });
      }
      return NextResponse.json({ success: true });
    }

    if (body.action === "order") {
      if (typeof body.id !== "string" || !uuidPattern.test(body.id) || !allowedFulfillmentStatuses.has(body.status)) {
        return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
      }
      const update: Record<string, string | null> = { fulfillment_status: body.status };
      if (typeof body.trackingNumber === "string") update.tracking_number = body.trackingNumber.trim() || null;

      const { error } = await context.db.from("km_orders").update(update).eq("id", body.id);
      if (error) {
        console.error("Admin order update failed:", error.message);
        return NextResponse.json({ error: "Could not save the order update." }, { status: 503 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid admin request." }, { status: 400 });
  }
}

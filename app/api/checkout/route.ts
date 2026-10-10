import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type CheckoutItemInput = { variantId: string; qty: number };
type CheckoutPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "cod";
  items: CheckoutItemInput[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckoutPayload>;
    const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
    const customerName = text(body.customerName);
    const customerEmail = text(body.customerEmail).toLowerCase();
    const customerPhone = text(body.customerPhone);
    const addressLine1 = text(body.addressLine1);
    const addressLine2 = text(body.addressLine2);
    const city = text(body.city);
    const state = text(body.state);
    const pincode = text(body.pincode);

    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json({ error: "Please complete all required delivery details." }, { status: 400 });
    }
    if (customerName.length > 120 || customerEmail.length > 254 || addressLine1.length > 250 ||
        addressLine2.length > 250 || city.length > 100 || state.length > 100) {
      return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!/^[0-9]{10}$/.test(customerPhone) || !/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number and 6-digit pincode." }, { status: 400 });
    }
    if (body.paymentMethod !== "cod") {
      return NextResponse.json({ error: "Online payment is not enabled yet. Please select Cash on Delivery." }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 10) {
      return NextResponse.json({ error: "Your bag is empty or contains too many different items." }, { status: 400 });
    }
    const items = body.items;
    const ids = items.map((item) => item?.variantId);
    if (ids.some((id) => typeof id !== "string" || id.length < 1 || id.length > 100) ||
        new Set(ids).size !== ids.length ||
        items.some((item) => !Number.isInteger(item?.qty) || item.qty < 1 || item.qty > 20)) {
      return NextResponse.json({ error: "Your bag contains invalid item quantities. Please review your bag." }, { status: 400 });
    }

    // Price, availability, stock locks, inventory decrement and order writes happen
    // in one PostgreSQL transaction inside this RPC; never reserve stock in app code.
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("km_place_cod_order", {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone,
      p_address_line1: addressLine1,
      p_address_line2: addressLine2 || null,
      p_city: city,
      p_state: state,
      p_pincode: pincode,
      p_items: items.map(({ variantId, qty }) => ({ variantId, qty })),
    });

    if (error || !data?.success) {
      const reason = error?.message ?? "";
      if (/INSUFFICIENT_STOCK|ITEM_UNAVAILABLE|invalid input syntax for type uuid/i.test(reason)) {
        return NextResponse.json({ error: "An item is no longer available in the requested quantity. Refresh your bag and try again." }, { status: 409 });
      }
      if (/INVALID_ITEMS|DUPLICATE_VARIANTS|INVALID_CUSTOMER_DETAILS/i.test(reason)) {
        return NextResponse.json({ error: "Some checkout details are invalid. Please review them and try again." }, { status: 400 });
      }
      console.error("Atomic checkout failed:", reason);
      return NextResponse.json({ error: "We couldn’t safely place your order. No partial order was saved; please try again shortly." }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      orderReference: data.orderReference,
      totalAmountInr: Number(data.totalAmountInr),
      subtotalInr: Number(data.subtotalInr),
      shippingFeeInr: Number(data.shippingFeeInr),
      paymentMethod: "cod",
      customerName,
      customerEmail,
      message: "Your Cash on Delivery order has been placed.",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json({ error: "Checkout is not configured on the server yet. Add SUPABASE_SERVICE_ROLE_KEY to server environment variables." }, { status: 503 });
    }
    console.error("Unexpected checkout error:", error);
    return NextResponse.json({ error: "An unexpected checkout error occurred. Please try again." }, { status: 500 });
  }
}

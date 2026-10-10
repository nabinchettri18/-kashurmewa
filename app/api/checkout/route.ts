import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
type VerifiedItem = {
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPriceInr: number;
  totalPriceInr: number;
  stockBeforeReservation: number;
};

async function releaseReservations(items: VerifiedItem[]) {
  for (const item of [...items].reverse()) {
    await supabase.from("km_product_variants")
      .update({ stock: item.stockBeforeReservation })
      .eq("id", item.variantId)
      .eq("stock", item.stockBeforeReservation - item.quantity);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckoutPayload>;
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
    const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";
    const addressLine1 = typeof body.addressLine1 === "string" ? body.addressLine1.trim() : "";
    const addressLine2 = typeof body.addressLine2 === "string" ? body.addressLine2.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const state = typeof body.state === "string" ? body.state.trim() : "";
    const pincode = typeof body.pincode === "string" ? body.pincode.trim() : "";

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

    // Never accept an unpaid online order until gateway creation and signature verification exist.
    if (body.paymentMethod !== "cod") {
      return NextResponse.json({ error: "Online payment is not enabled yet. Please select Cash on Delivery." }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 10) {
      return NextResponse.json({ error: "Your bag is empty or contains too many different items." }, { status: 400 });
    }
    const items = body.items;
    const variantIds = items.map((item) => item?.variantId);
    if (variantIds.some((id) => typeof id !== "string" || id.length < 1 || id.length > 100) ||
        new Set(variantIds).size !== variantIds.length ||
        items.some((item) => !Number.isInteger(item?.qty) || item.qty < 1 || item.qty > 20)) {
      return NextResponse.json({ error: "Your bag contains invalid item quantities. Please review your bag." }, { status: 400 });
    }

    const { data: dbVariants, error: catalogueError } = await supabase
      .from("km_product_variants")
      .select("id, product_id, size, price_inr, stock, km_products!inner(name, active)")
      .in("id", variantIds)
      .eq("active", true)
      .eq("km_products.active", true);

    if (catalogueError) {
      console.error("Checkout catalogue verification failed:", catalogueError.message);
      return NextResponse.json({ error: "We couldn’t verify live prices and stock. Please try again shortly." }, { status: 503 });
    }
    if (!dbVariants || dbVariants.length !== variantIds.length) {
      return NextResponse.json({ error: "One or more items are no longer available. Please refresh your bag." }, { status: 409 });
    }

    const verifiedItems: VerifiedItem[] = [];
    let subtotalInr = 0;
    for (const clientItem of items) {
      const variant = dbVariants.find((candidate: any) => candidate.id === clientItem.variantId) as any;
      if (!variant) return NextResponse.json({ error: "A selected pack is no longer available." }, { status: 409 });
      const unitPriceInr = Number(variant.price_inr);
      const stockBeforeReservation = Number(variant.stock ?? 0);
      if (!Number.isFinite(unitPriceInr) || unitPriceInr < 0) {
        return NextResponse.json({ error: "A product has an invalid current price. Please contact the store." }, { status: 503 });
      }
      if (!Number.isInteger(stockBeforeReservation) || stockBeforeReservation < clientItem.qty) {
        return NextResponse.json({ error: "Not enough stock remains for the " + variant.size + " pack. Please update your bag." }, { status: 409 });
      }
      const totalPriceInr = Math.round(unitPriceInr * clientItem.qty * 100) / 100;
      subtotalInr += totalPriceInr;
      verifiedItems.push({
        productId: variant.product_id,
        variantId: variant.id,
        productName: variant.km_products?.name || "Kashurmewa walnuts",
        size: variant.size,
        quantity: clientItem.qty,
        unitPriceInr,
        totalPriceInr,
        stockBeforeReservation,
      });
    }

    subtotalInr = Math.round(subtotalInr * 100) / 100;
    const shippingFeeInr = subtotalInr >= 999 ? 0 : 99;
    const totalAmountInr = Math.round((subtotalInr + shippingFeeInr) * 100) / 100;

    // Conditional updates prevent two simultaneous checkouts reserving the same stock snapshot.
    const reserved: VerifiedItem[] = [];
    for (const item of verifiedItems) {
      const { data, error } = await supabase.from("km_product_variants")
        .update({ stock: item.stockBeforeReservation - item.quantity })
        .eq("id", item.variantId)
        .eq("stock", item.stockBeforeReservation)
        .gte("stock", item.quantity)
        .select("id")
        .maybeSingle();
      if (error || !data) {
        await releaseReservations(reserved);
        return NextResponse.json({ error: "Stock changed for the " + item.size + " pack. Please refresh your bag and try again." }, { status: 409 });
      }
      reserved.push(item);
    }

    const orderReference = "KM-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + randomUUID().slice(0, 8).toUpperCase();
    const { data: orderData, error: orderError } = await supabase.from("km_orders")
      .insert({
        order_reference: orderReference,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        pincode,
        subtotal_inr: subtotalInr,
        shipping_fee_inr: shippingFeeInr,
        total_amount_inr: totalAmountInr,
        payment_method: "cod",
        payment_status: "pending",
        fulfillment_status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !orderData?.id) {
      await releaseReservations(reserved);
      console.error("Checkout order insert failed:", orderError?.message);
      return NextResponse.json({ error: "We couldn’t save your order. No order was confirmed; please try again." }, { status: 503 });
    }

    const orderItemsToInsert = verifiedItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.productName,
      variant_size: item.size,
      quantity: item.quantity,
      unit_price_inr: item.unitPriceInr,
      total_price_inr: item.totalPriceInr,
    }));
    const { error: orderItemsError } = await supabase.from("km_order_items").insert(orderItemsToInsert);

    if (orderItemsError) {
      const { error: cleanupError } = await supabase.from("km_orders").delete().eq("id", orderData.id);
      await releaseReservations(reserved);
      console.error("Checkout order items insert failed:", orderItemsError.message, cleanupError?.message);
      return NextResponse.json({ error: "We couldn’t save the full order. Please try again; contact the store if you see a reference for this attempt." }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      orderReference,
      totalAmountInr,
      subtotalInr,
      shippingFeeInr,
      paymentMethod: "cod",
      customerName,
      customerEmail,
      message: "Your Cash on Delivery order has been placed.",
    });
  } catch (error) {
    console.error("Unexpected checkout error:", error);
    return NextResponse.json({ error: "An unexpected checkout error occurred. Please try again." }, { status: 500 });
  }
}

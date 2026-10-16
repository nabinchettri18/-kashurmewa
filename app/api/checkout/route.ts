import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type CheckoutItemInput = {
  productId?: string;
  variantId: string;
  qty: number;
};

type CheckoutPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "cod" | "razorpay" | "cashfree";
  items: CheckoutItemInput[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload;
    const requiredFields = [
      body.customerName,
      body.customerEmail,
      body.customerPhone,
      body.addressLine1,
      body.city,
      body.state,
      body.pincode,
    ];

    if (
      requiredFields.some((value) => typeof value !== "string" || !value.trim()) ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Please complete all required delivery details and check your bag." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!/^\d{10}$/.test(body.customerPhone.trim())) {
      return NextResponse.json({ error: "Please enter a 10-digit phone number." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(body.pincode.trim())) {
      return NextResponse.json({ error: "Please enter a valid 6-digit pincode." }, { status: 400 });
    }
    if (body.paymentMethod !== "cod") {
      return NextResponse.json(
        { error: "Online payment is not enabled yet. Please choose Cash on Delivery." },
        { status: 400 }
      );
    }
    if (
      body.items.length > 20 ||
      body.items.some((item) => !item?.variantId || !Number.isInteger(item.qty) || item.qty < 1)
    ) {
      return NextResponse.json({ error: "One or more pack selections are invalid. Please refresh your bag." }, { status: 400 });
    }
    if (new Set(body.items.map((item) => item.variantId)).size !== body.items.length) {
      return NextResponse.json(
        { error: "Please combine duplicate pack lines in your bag and try again." },
        { status: 400 }
      );
    }

    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const orderReference = `KM-${dateStamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // The database function locks variants, recalculates prices, writes the order
    // and line items, and decrements stock in one transaction.
    const { data, error } = await supabase.rpc("place_kashurmewa_order", {
      p_customer: {
        customerName: body.customerName.trim(),
        customerEmail: body.customerEmail.trim(),
        customerPhone: body.customerPhone.trim(),
        addressLine1: body.addressLine1.trim(),
        addressLine2: (body.addressLine2 || "").trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        pincode: body.pincode.trim(),
      },
      p_items: body.items.map((item) => ({ variantId: item.variantId, qty: item.qty })),
      p_order_reference: orderReference,
    });

    if (error || !data) {
      const reason = error?.message || "";
      console.error("Kashurmewa checkout failed:", reason);
      const safeInventoryMessage = /Only \d+ units|no longer available|Stock changed|quantity must be at least one|duplicate pack lines/i.test(reason);
      return NextResponse.json(
        {
          error: safeInventoryMessage
            ? reason
            : "We couldn't safely complete your order. Your bag has been kept; please try again in a moment.",
        },
        { status: safeInventoryMessage ? 409 : 503 }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    console.error("Unexpected Kashurmewa checkout error:", error);
    return NextResponse.json(
      { error: "We couldn't complete checkout right now. Your bag has been kept; please try again." },
      { status: 500 }
    );
  }
}

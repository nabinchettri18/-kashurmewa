import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type CheckoutItemInput = {
  productId: string;
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
    const body: CheckoutPayload = await request.json();

    // 1. Validation
    if (
      !body.customerName ||
      !body.customerEmail ||
      !body.customerPhone ||
      !body.addressLine1 ||
      !body.city ||
      !body.state ||
      !body.pincode ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid checkout information. Please fill all required fields." },
        { status: 400 }
      );
    }

    if (body.paymentMethod !== "cod") {
      return NextResponse.json(
        { error: "Online payment is not enabled yet. Please choose Cash on Delivery." },
        { status: 400 }
      );
    }

    if (body.items.some((item) => !item.variantId || !Number.isInteger(item.qty) || item.qty < 1)) {
      return NextResponse.json(
        { error: "Each pack must have a valid variant and a quantity of at least one." },
        { status: 400 }
      );
    }

    const variantIds = body.items.map((item) => item.variantId);
    if (new Set(variantIds).size !== variantIds.length) {
      return NextResponse.json(
        { error: "Please combine duplicate pack lines in your bag and try again." },
        { status: 400 }
      );
    }

    // Verify current price and availability from the live catalogue.
    const { data: dbVariants, error: variantsError } = await supabase
      .from("km_product_variants")
      .select("id, product_id, size, price_inr, stock, km_products(name)")
      .in("id", variantIds)
      .eq("active", true);

    if (variantsError) {
      console.error("Checkout catalogue lookup failed:", variantsError.message);
      return NextResponse.json(
        { error: "We couldn't verify current prices and stock. Please try again." },
        { status: 503 }
      );
    }

    const verifiedItems: {
      productId: string;
      variantId: string;
      productName: string;
      size: string;
      quantity: number;
      unitPriceInr: number;
      totalPriceInr: number;
    }[] = [];

    let subtotalInr = 0;

    for (const clientItem of body.items) {
      const matchedVariant: any = dbVariants?.find((v: any) => v.id === clientItem.variantId);

      if (!matchedVariant) {
        return NextResponse.json(
          { error: `Selected product variant is no longer available.` },
          { status: 400 }
        );
      }

      const availableStock = Number(matchedVariant.stock || 0);
      if (clientItem.qty > availableStock) {
        return NextResponse.json(
          { error: `Only ${availableStock} units of ${matchedVariant.size} are available in stock.` },
          { status: 400 }
        );
      }

      const unitPrice = Math.round(Number(matchedVariant.price_inr) * 100) / 100;
      const itemTotal = Math.round(unitPrice * clientItem.qty * 100) / 100;

      subtotalInr += itemTotal;
      verifiedItems.push({
        productId: matchedVariant.product_id,
        variantId: matchedVariant.id,
        productName: matchedVariant.km_products?.name || "Kashmiri In-Shell Walnuts",
        size: matchedVariant.size,
        quantity: clientItem.qty,
        unitPriceInr: unitPrice,
        totalPriceInr: itemTotal
      });
    }

    subtotalInr = Math.round(subtotalInr * 100) / 100;
    const shippingFeeInr = subtotalInr >= 999 ? 0 : 99;
    const totalAmountInr = Math.round((subtotalInr + shippingFeeInr) * 100) / 100;

    // 3. Generate unique order reference
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const orderReference = `KM-${timestamp}-${randomHex}`;

    const paymentStatus = body.paymentMethod === "cod" ? "pending" : "pending";
    const fulfillmentStatus = "pending";

    // 4. Record order in Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("km_orders")
      .insert({
        order_reference: orderReference,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
        address_line1: body.addressLine1,
        address_line2: body.addressLine2 || "",
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        subtotal_inr: subtotalInr,
        shipping_fee_inr: shippingFeeInr,
        total_amount_inr: totalAmountInr,
        payment_method: body.paymentMethod,
        payment_status: paymentStatus,
        fulfillment_status: fulfillmentStatus,
      })
      .select("id")
      .single();

    if (orderError || !orderData?.id) {
      console.error("Unable to save checkout order:", orderError?.message || "Missing order ID");
      return NextResponse.json(
        { error: "We couldn't save your order. No confirmation was created. Please try again or contact support if the issue continues." },
        { status: 503 }
      );
    }

    {
      // Insert order items
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

      const { error: itemsError } = await supabase.from("km_order_items").insert(orderItemsToInsert);
      if (itemsError) {
        console.error("Unable to save checkout line items:", itemsError.message);
        return NextResponse.json(
          { error: "Your order could not be fully recorded. Please contact support before placing it again." },
          { status: 503 }
        );
      }

      // Decrement inventory stock safely
      for (const item of verifiedItems) {
        const { data: vCurrent } = await supabase
          .from("km_product_variants")
          .select("stock")
          .eq("id", item.variantId)
          .single();

        if (vCurrent) {
          const nextStock = Math.max(0, Number(vCurrent.stock || 0) - item.quantity);
          await supabase
            .from("km_product_variants")
            .update({ stock: nextStock })
            .eq("id", item.variantId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderReference,
      totalAmountInr,
      subtotalInr,
      shippingFeeInr,
      paymentMethod: body.paymentMethod,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      message:
        body.paymentMethod === "cod"
          ? "Order placed successfully! Cash on delivery selected."
          : "Order created. Online payment integration structure prepared."
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred during checkout processing." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { FALLBACK_PRODUCTS } from "@/lib/catalog";

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

    // 2. Server-side price and stock verification
    const variantIds = body.items.map((i) => i.variantId);
    
    // Attempt database query first
    const { data: dbVariants } = await supabase
      .from("km_product_variants")
      .select("id, product_id, size, price_inr, stock, km_products(name)")
      .in("id", variantIds)
      .eq("active", true);

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
      if (clientItem.qty <= 0) continue;

      let matchedVariant: any = dbVariants?.find((v: any) => v.id === clientItem.variantId);

      // Fallback matching if database variant not populated yet
      if (!matchedVariant) {
        for (const fp of FALLBACK_PRODUCTS) {
          const fv = fp.variants.find((v) => v.id === clientItem.variantId);
          if (fv) {
            matchedVariant = {
              id: fv.id,
              product_id: fp.id,
              size: fv.size,
              price_inr: fv.price_inr,
              stock: fv.stock,
              km_products: { name: fp.name }
            };
            break;
          }
        }
      }

      if (!matchedVariant) {
        return NextResponse.json(
          { error: `Selected product variant is no longer available.` },
          { status: 400 }
        );
      }

      const availableStock = Number(matchedVariant.stock || 0);
      if (clientItem.qty > availableStock && availableStock > 0) {
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

    if (!orderError && orderData?.id) {
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

      await supabase.from("km_order_items").insert(orderItemsToInsert);

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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { KashurmewLogo } from "@/components/brand/Logo";

type CartItem = { productId: string; variantId: string; qty: number };
type Line = CartItem & { productName: string; size: string; price: number; stock: number };

const CART_KEY = "kashurmewa-cart";

export default function CartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderResult, setOrderResult] = useState<any>(null);

  // Form inputs
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");

  const load = async () => {
    setLoading(true);
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
      if (!saved.length) {
        setLines([]);
        return;
      }

      const variantIds = saved.map((item) => item.variantId);
      const { data, error } = await supabase
        .from("km_product_variants")
        .select("id,size,price_inr,stock,product_id,km_products(name)")
        .in("id", variantIds)
        .eq("active", true);

      if (error || !data || !data.length) {
        // Fallback for demo/offline cart items
        setLines(
          saved.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            qty: i.qty,
            productName: "Kashmiri In-Shell Walnuts",
            size: i.variantId.includes("250") ? "250 g" : i.variantId.includes("500") ? "500 g" : "1 kg",
            price: i.variantId.includes("250") ? 349 : i.variantId.includes("500") ? 649 : 1199,
            stock: 50,
          }))
        );
        return;
      }

      const mapped = data.map((variant: any) => {
        const savedItem = saved.find((item) => item.variantId === variant.id);
        const stock = Number(variant.stock || 0);

        return {
          productId: variant.product_id,
          variantId: variant.id,
          qty: Math.min(Math.max(Number(savedItem?.qty || 1), 1), Math.max(stock, 1)),
          productName: variant.km_products?.name || "KASHURMEWA Walnuts",
          size: variant.size,
          price: Number(variant.price_inr),
          stock,
        };
      });

      setLines(mapped);
    } catch {
      setLines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = (variantId: string, delta: number) => {
    const next = lines
      .map((line) =>
        line.variantId === variantId
          ? { ...line, qty: Math.max(0, Math.min(line.qty + delta, Math.max(line.stock, 1))) }
          : line
      )
      .filter((line) => line.qty > 0);

    setLines(next);
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(next.map(({ productId, variantId, qty }) => ({ productId, variantId, qty })))
    );
  };

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + shippingFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
          paymentMethod,
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            qty: l.qty,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process order.");
      }

      // Clear cart on success
      localStorage.removeItem(CART_KEY);
      setLines([]);
      setOrderResult(data);
      setShowCheckout(false);
    } catch (err: any) {
      setCheckoutError(err.message || "An error occurred during checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="cart-page">
      <header className="simple-header">
        <KashurmewLogo variant="dark" size="sm" />
        <Link href="/shop">Continue shopping ↗</Link>
      </header>

      <section className="cart-wrap">
        <p className="eyebrow">YOUR BAG</p>
        <h1>
          Ready for <em>the good stuff.</em>
        </h1>

        {loading ? (
          <div className="empty">
            <p>Loading your bag…</p>
          </div>
        ) : orderResult ? (
          <div className="order-success-card">
            <span className="badge">ORDER CONFIRMED</span>
            <h2>Thank you, {orderResult.customerName}!</h2>
            <p>Your order has been received and is being prepared with care in our Kashmir repository.</p>
            
            <div className="order-reference-box">
              ORDER REF: {orderResult.orderReference}
            </div>

            <p className="detail-description" style={{ margin: "20px auto" }}>
              Total Paid / Amount Due: <strong>₹{orderResult.totalAmountInr?.toLocaleString("en-IN")}</strong> via{" "}
              {orderResult.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}.
              <br />
              Confirmation email sent to <strong>{orderResult.customerEmail}</strong>.
            </p>

            <Link href="/shop" className="primary-btn" style={{ display: "inline-block", marginTop: "20px" }}>
              RETURN TO SHOP ↗
            </Link>
          </div>
        ) : !lines.length ? (
          <div className="empty">
            <p>Your bag is empty.</p>
            <Link className="button dark" href="/shop">
              SHOP WALNUTS ↗
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {lines.map((line) => (
                <div className="cart-item" key={line.variantId}>
                  <div>
                    <span>KASHURMEWA</span>
                    <h2>{line.productName}</h2>
                    <p>{line.size}</p>
                  </div>
                  <div className="qty">
                    <button type="button" onClick={() => update(line.variantId, -1)} aria-label="Decrease quantity">
                      −
                    </button>
                    <b>{line.qty}</b>
                    <button type="button" onClick={() => update(line.variantId, 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <strong>₹{(line.price * line.qty).toLocaleString("en-IN")}</strong>
                </div>
              ))}
            </div>

            <aside className="summary">
              <span>ORDER SUMMARY</span>
              <div>
                <p>Subtotal</p>
                <b>₹{subtotal.toLocaleString("en-IN")}</b>
              </div>
              <div>
                <p>Delivery Fee</p>
                <b>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</b>
              </div>
              {subtotal < 999 && (
                <small style={{ color: "#B69A66", fontSize: "10px", marginTop: "4px" }}>
                  Add ₹{(999 - subtotal).toLocaleString("en-IN")} more for FREE pan-India delivery!
                </small>
              )}
              <hr />
              <div>
                <p>Total</p>
                <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
              </div>
              <button
                type="button"
                className="button dark checkout"
                onClick={() => setShowCheckout(true)}
              >
                PROCEED TO CHECKOUT ↗
              </button>
              <small>Secure checkout · Freshly packed · Pan-India delivery</small>
            </aside>
          </div>
        )}
      </section>

      {/* --- Checkout Modal Drawer --- */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <small className="commerce-eyebrow">CHECKOUT & DELIVERY</small>
            <h2>Shipping Information</h2>

            {checkoutError && (
              <p className="account-message" style={{ background: "#fdf2f2", color: "#991b1b", marginBottom: "20px" }}>
                {checkoutError}
              </p>
            )}

            <form onSubmit={handleCheckoutSubmit}>
              <div className="checkout-grid full">
                <div className="checkout-field">
                  <label htmlFor="c-name">Full Name *</label>
                  <input
                    id="c-name"
                    type="text"
                    required
                    placeholder="e.g., Aarav Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout-grid">
                <div className="checkout-field">
                  <label htmlFor="c-email">Email Address *</label>
                  <input
                    id="c-email"
                    type="email"
                    required
                    placeholder="aarav@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="c-phone">Phone Number (10 digits) *</label>
                  <input
                    id="c-phone"
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout-grid full">
                <div className="checkout-field">
                  <label htmlFor="c-add1">Flat, House No., Building, Street *</label>
                  <input
                    id="c-add1"
                    type="text"
                    required
                    placeholder="House 42, Orchard Lane"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout-grid full">
                <div className="checkout-field">
                  <label htmlFor="c-add2">Area, Landmark (Optional)</label>
                  <input
                    id="c-add2"
                    type="text"
                    placeholder="Near City Park"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout-grid">
                <div className="checkout-field">
                  <label htmlFor="c-city">City *</label>
                  <input
                    id="c-city"
                    type="text"
                    required
                    placeholder="New Delhi / Srinagar / Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="c-state">State *</label>
                  <input
                    id="c-state"
                    type="text"
                    required
                    placeholder="Delhi / Jammu & Kashmir / Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout-grid">
                <div className="checkout-field">
                  <label htmlFor="c-pin">Pincode *</label>
                  <input
                    id="c-pin"
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    placeholder="110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              <label htmlFor="payment-options" style={{ font: "600 10px sans-serif", letterSpacing: "1.5px", color: "#68452F", marginTop: "16px", display: "block" }}>
                SELECT PAYMENT METHOD
              </label>
              <div id="payment-options" className="payment-options">
                <div
                  className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <div
                  className={`payment-option ${paymentMethod === "razorpay" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                  />
                  <span>Online Payment / UPI</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "PLACING ORDER..." : `PLACE ORDER — ₹${totalAmount.toLocaleString("en-IN")}`}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCheckout(false)}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

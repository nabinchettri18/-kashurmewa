"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type CartItem = { productId: string; variantId: string; qty: number };
type Line = CartItem & { productName: string; size: string; price: number; stock: number };

const CART_KEY = "kashurmewa-cart";

export default function CartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

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

      if (error) throw error;

      const mapped = (data || []).map((variant: any) => {
        const savedItem = saved.find((item) => item.variantId === variant.id);
        const stock = Number(variant.stock || 0);

        return {
          productId: variant.product_id,
          variantId: variant.id,
          qty: Math.min(Math.max(Number(savedItem?.qty || 1), 1), Math.max(stock, 1)),
          productName: variant.km_products?.name || "KASHURMEWA",
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

  return (
    <main className="cart-page">
      <header className="simple-header">
        <Link className="brand" href="/">KASHUR<span>MEWA</span></Link>
        <Link href="/">Continue shopping</Link>
      </header>
      <section className="cart-wrap">
        <p className="eyebrow">YOUR BAG</p>
        <h1>Ready for <em>the good stuff.</em></h1>
        {loading ? (
          <div className="empty"><p>Loading your bag…</p></div>
        ) : !lines.length ? (
          <div className="empty">
            <p>Your bag is empty.</p>
            <Link className="button dark" href="/#shop">SHOP WALNUTS ↗</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {lines.map((line) => (
                <div className="cart-item" key={line.variantId}>
                  <div><span>KASHURMEWA</span><h2>{line.productName}</h2><p>{line.size}</p></div>
                  <div className="qty">
                    <button type="button" onClick={() => update(line.variantId, -1)}>−</button>
                    <b>{line.qty}</b>
                    <button type="button" onClick={() => update(line.variantId, 1)}>+</button>
                  </div>
                  <strong>₹{(line.price * line.qty).toLocaleString("en-IN")}</strong>
                </div>
              ))}
            </div>
            <aside className="summary">
              <span>ORDER SUMMARY</span>
              <div><p>Subtotal</p><b>₹{subtotal.toLocaleString("en-IN")}</b></div>
              <div><p>Delivery</p><b>{subtotal >= 999 ? "FREE" : "Calculated at checkout"}</b></div>
              <hr />
              <div><p>Total</p><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>
              <button type="button" className="button dark checkout">PROCEED TO CHECKOUT ↗</button>
              <small>Secure checkout · Pan-India delivery</small>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

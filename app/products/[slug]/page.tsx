"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { KashurmewLogo } from "@/components/brand/Logo";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    (async () => {
      const p = await fetchProductBySlug(params.slug || "kashmiri-walnuts");
      if (p) {
        setProduct(p);
        if (p.variants.length) {
          setSize(p.variants[0].size);
        }
      }
    })();
  }, [params.slug]);

  const selectedVariant: ProductVariant | undefined = product?.variants.find((x) => x.size === size) || product?.variants[0];
  const mainImage = product?.images[selectedImage]?.url || "https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg";

  const addToBag = () => {
    if (!product || !selectedVariant) return;
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const found = cart.find((i: { variantId: string }) => i.variantId === selectedVariant.id);
      if (found) {
        found.qty = Math.min(found.qty + qty, selectedVariant.stock || 50);
      } else {
        cart.push({
          productId: product.id,
          variantId: selectedVariant.id,
          qty: Math.min(qty, selectedVariant.stock || 50),
        });
      }
      localStorage.setItem("kashurmewa-cart", JSON.stringify(cart));
      setNotice(`Added ${qty} × ${selectedVariant.size} pack to your bag.`);
      setTimeout(() => setNotice(""), 4000);
    } catch {}
  };

  if (!product) {
    return (
      <main className="commerce-page">
        <header className="commerce-header">
          <KashurmewLogo variant="dark" size="sm" />
          <Link href="/shop">← Back to shop</Link>
        </header>
        <div className="commerce-loading">Loading product catalog…</div>
      </main>
    );
  }

  return (
    <main className="commerce-page">
      <header className="commerce-header">
        <KashurmewLogo variant="dark" size="sm" />
        <nav>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/account">Account</Link>
        </nav>
        <Link className="commerce-bag" href="/cart">
          Bag ↗
        </Link>
      </header>

      <div className="product-breadcrumb">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {product.name}
      </div>

      <section className="product-detail">
        <div>
          <div className="detail-main-image">
            <img src={mainImage} alt={product.name} />
          </div>
          <div className="detail-image-note">
            <span>01 / ORIGIN: {product.origin}</span>
            <span>100% IN-SHELL NATURAL WALNUTS</span>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                style={{
                  width: "70px",
                  height: "70px",
                  border: selectedImage === idx ? "2px solid #344B3A" : "1px solid #E7DED1",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img src={img.url} alt={img.alt_text || product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-buy">
          <span className="commerce-eyebrow">KASHURMEWA SIGNATURE</span>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-rating">
            ✦ Sourced directly from high-altitude orchards in Kashmir · Packed for natural freshness
          </div>

          <div className="detail-price">
            ₹{selectedVariant ? (selectedVariant.price_inr * qty).toLocaleString("en-IN") : "—"}
            <span>INR · Inclusive of all applicable taxes · Free delivery above ₹999</span>
          </div>

          <span className="commerce-eyebrow" style={{ display: "block", marginTop: "20px" }}>
            CHOOSE PACK SIZE
          </span>
          <div className="detail-variants">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock <= 0}
                className={size === v.size ? "chosen" : ""}
                onClick={() => setSize(v.size)}
              >
                <b>{v.size}</b>
                <span>₹{v.price_inr.toLocaleString("en-IN")}</span>
              </button>
            ))}
          </div>

          <div className="detail-quantity">
            <span>Quantity</span>
            <div>
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                −
              </button>
              <b>{qty}</b>
              <button
                onClick={() => setQty(Math.min(selectedVariant?.stock || 50, qty + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <small>{selectedVariant?.stock ? `${selectedVariant.stock} units available` : "In Stock"}</small>
          </div>

          <button className="detail-add" disabled={!selectedVariant || selectedVariant.stock <= 0} onClick={addToBag}>
            {selectedVariant && selectedVariant.stock > 0
              ? `ADD TO BAG — ₹${(selectedVariant.price_inr * qty).toLocaleString("en-IN")}`
              : "OUT OF STOCK"}{" "}
            <span>↗</span>
          </button>

          {notice && (
            <p className="commerce-notice" style={{ marginTop: "14px", fontWeight: 600 }}>
              {notice} <Link href="/cart">Proceed to cart & checkout →</Link>
            </p>
          )}

          <div className="detail-promises">
            <div>
              <b>Net Weight & Packaging Note</b>
              <span>
                Net pack weight reflects whole walnuts inside natural shells. Walnuts in shell naturally maintain their crispness and kernel oils longer.
              </span>
            </div>
            <div>
              <b>Storage Instructions</b>
              <span>{product.storage_instructions || "Store in a cool, dry place in an airtight container."}</span>
            </div>
            <div>
              <b>Shelf Life</b>
              <span>{product.shelf_life || "6 Months from packaging date."}</span>
            </div>
            <div>
              <b>Ingredients</b>
              <span>{product.ingredients}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-story">
        <span className="commerce-eyebrow">THE KASHURMEWA COMMITMENT</span>
        <h2>
          Simple by nature.<br />
          <i>Considered by design.</i>
        </h2>
        <p>
          Our walnuts are carefully gathered from Kashmiri orchards, sorted to remove broken shells, and packed without chemical washing or bleaching. What you receive is authentic Kashmiri produce in its pure, natural state.
        </p>
      </section>

      <footer className="commerce-footer">
        <KashurmewLogo variant="dark" size="sm" />
        <Link href="/shop">Continue shopping</Link>
        <Link href="/cart">Your bag</Link>
        <Link href="/policies/shipping">Shipping Policy</Link>
      </footer>
    </main>
  );
}
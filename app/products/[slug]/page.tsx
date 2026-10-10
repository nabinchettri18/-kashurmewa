"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Minus, Plus, ShieldCheck, Truck, Leaf } from "lucide-react";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await fetchProductBySlug(params.slug || "kashmiri-walnuts");
        if (!cancelled && p) {
          setProduct(p);
          const preferred = p.variants.find((v) => v.size.toLowerCase() === "500 g") || p.variants[0];
          if (preferred) setSize(preferred.size);
        }
      } catch (error) {
        console.error("Unable to load product details from Supabase.", error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      if (!cancelled) setCartCount(cart.reduce((total: number, item: { qty?: number }) => total + Number(item.qty || 0), 0));
    } catch {}

    return () => { cancelled = true; };
  }, [params.slug]);

  const selectedVariant: ProductVariant | undefined =
    product?.variants.find((variant) => variant.size === size) || product?.variants[0];
  const images = product?.images || [];
  const mainImage = images[selectedImage]?.url || images[0]?.url;

  const addToBag = () => {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return;

    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const existing = cart.find((item: { variantId: string }) => item.variantId === selectedVariant.id);
      const alreadyInCart = Number(existing?.qty || 0);
      if (alreadyInCart >= selectedVariant.stock) {
        setNotice("Your bag already contains the available quantity for this pack.");
        return;
      }

      if (existing) {
        existing.qty = Math.min(alreadyInCart + qty, selectedVariant.stock);
      } else {
        cart.push({ productId: product.id, variantId: selectedVariant.id, qty: Math.min(qty, selectedVariant.stock) });
      }

      localStorage.setItem("kashurmewa-cart", JSON.stringify(cart));
      const count = cart.reduce((total: number, item: { qty?: number }) => total + Number(item.qty || 0), 0);
      setCartCount(count);
      setNotice(`Added ${Math.min(qty, selectedVariant.stock - alreadyInCart)} × ${selectedVariant.size} pack to your bag.`);
    } catch {
      setNotice("We couldn’t update your bag. Please try again.");
    }
  };

  if (loading || loadError || !product) {
    return (
      <main className="commerce-page">
        <NavigationHeader />
        <div className="product-state">
          <span className="commerce-eyebrow">KASHURMEWA SIGNATURE</span>
          <h1>{loading ? "A moment, please." : loadError ? "We couldn’t load this harvest." : "This product is unavailable."}</h1>
          <p>{loading ? "Loading the latest product details and prices…" : loadError ? "Please check your connection and refresh the page." : "This item may be temporarily unavailable. Explore the shop for current selections."}</p>
          <Link className="product-back-link" href="/shop"><ArrowLeft size={15} /> Back to shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="commerce-page premium-product-page">
      <NavigationHeader cartCount={cartCount} />

      <div className="premium-breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span>{product.name}</span>
      </div>

      <section className="premium-product-layout">
        <div className="premium-gallery">
          <div className="premium-main-image">
            {mainImage ? <img src={mainImage} alt={images[selectedImage]?.alt_text || product.name} /> : <div className="premium-image-placeholder">Product photography coming soon</div>}
            <span className="premium-image-label">KASHURMEWA · SIGNATURE HARVEST</span>
          </div>
          {images.length > 1 && (
            <div className="premium-thumbnails" aria-label="Product images">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  className={selectedImage === index ? "active" : ""}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                >
                  <img src={image.url} alt={image.alt_text || `${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
          <div className="premium-origin-note">
            <span>ORIGIN</span><strong>{product.origin}</strong>
            <span className="premium-origin-divider" />
            <span>INGREDIENTS</span><strong>{product.ingredients}</strong>
          </div>
        </div>

        <div className="premium-buy-panel">
          <span className="commerce-eyebrow">A LITTLE CLOSER TO NATURE</span>
          <h1>{product.name}</h1>
          <p className="premium-description">{product.description}</p>

          <div className="premium-quality-line"><Leaf size={15} /><span>Whole walnuts · Natural shells · Thoughtfully packed</span></div>

          <div className="premium-price-block">
            <div>
              <span className="premium-price-caption">YOUR SELECTED PACK</span>
              <strong>{selectedVariant ? `₹${selectedVariant.price_inr.toLocaleString("en-IN")}` : "Price unavailable"}</strong>
            </div>
            <span className="premium-tax-note">INR · Inclusive of applicable taxes</span>
          </div>

          <div className="premium-option-heading">
            <span>Choose pack size</span>
            <span>{selectedVariant?.size || ""}</span>
          </div>
          <div className="premium-pack-options">
            {product.variants.map((variant) => (
              <button
                type="button"
                key={variant.id}
                disabled={variant.stock <= 0}
                className={size === variant.size ? "selected" : ""}
                onClick={() => { setSize(variant.size); setQty(1); setNotice(""); }}
                aria-pressed={size === variant.size}
              >
                <span>{variant.size}</span>
                <strong>₹{variant.price_inr.toLocaleString("en-IN")}</strong>
                <small>{variant.stock > 0 ? "AVAILABLE" : "SOLD OUT"}</small>
              </button>
            ))}
          </div>

          <div className="premium-quantity-row">
            <div>
              <span>Quantity</span>
              <div className="premium-quantity-control">
                <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((value) => Math.max(1, value - 1))}><Minus size={14} /></button>
                <strong>{qty}</strong>
                <button type="button" aria-label="Increase quantity" disabled={!selectedVariant || qty >= selectedVariant.stock} onClick={() => setQty((value) => Math.min(selectedVariant?.stock || 1, value + 1))}><Plus size={14} /></button>
              </div>
            </div>
            <small className={selectedVariant?.stock ? "in-stock" : "out-of-stock"}>
              {selectedVariant?.stock ? "Ready to ship" : "Currently unavailable"}
            </small>
          </div>

          <button type="button" className="premium-add-button" disabled={!selectedVariant || selectedVariant.stock <= 0 || qty > selectedVariant.stock} onClick={addToBag}>
            <span>{selectedVariant && selectedVariant.stock > 0 ? `ADD TO BAG · ₹${(selectedVariant.price_inr * qty).toLocaleString("en-IN")}` : "SOLD OUT"}</span>
            <ArrowUpRight size={17} />
          </button>
          {notice && <div className="premium-cart-notice" role="status"><Check size={15} /><span>{notice}</span><Link href="/cart">View bag →</Link></div>}

          <div className="premium-delivery-note">
            <Truck size={17} />
            <div><strong>Delivery across India</strong><span>Free delivery on orders above ₹999. Delivery timelines are confirmed at checkout.</span></div>
          </div>

          <div className="premium-assurances">
            <div><ShieldCheck size={17} /><span>Secure checkout</span></div>
            <div><Leaf size={17} /><span>Simple ingredients</span></div>
          </div>

          <div className="premium-details">
            <details open>
              <summary>Storage & freshness</summary>
              <p>{product.storage_instructions || "Store in a cool, dry place away from direct heat and humidity. Keep sealed after opening."}</p>
            </details>
            <details>
              <summary>Shelf life</summary>
              <p>{product.shelf_life || "Refer to the packed-on and best-before details on your product packaging."}</p>
            </details>
            <details>
              <summary>Ingredients & origin</summary>
              <p>{product.ingredients}. Origin: {product.origin}.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="premium-product-story">
        <span className="commerce-eyebrow">THE KASHURMEWA APPROACH</span>
        <h2>Simple by nature.<br /><i>Considered by design.</i></h2>
        <p>We keep the focus on the walnut itself: a familiar ingredient, a natural shell, and thoughtful presentation for everyday use or gifting.</p>
        <Link href="/shop">Explore the collection <ArrowUpRight size={15} /></Link>
      </section>

      <footer className="commerce-footer">
        <Link href="/" className="premium-footer-brand">Kashurmewa</Link>
        <span>Authentic produce, thoughtfully presented.</span>
        <Link href="/policies/shipping">Shipping policy</Link>
        <Link href="/cart">Your bag</Link>
      </footer>
    </main>
  );
}

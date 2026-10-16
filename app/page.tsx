"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Leaf, PackageCheck, ShieldCheck, ShoppingBag, Sprout, Truck } from "lucide-react";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import "./kashurmewa-storefront.css";

const WALNUT_HERO = "https://images.pexels.com/photos/17832132/pexels-photo-17832132.jpeg?auto=compress&cs=tinysrgb&w=2400&q=92";
const WALNUT_DETAIL = "https://images.pexels.com/photos/36358810/pexels-photo-36358810.jpeg?auto=compress&cs=tinysrgb&w=2000&q=92";
const ORCHARD_IMAGE = "https://images.pexels.com/photos/28553972/pexels-photo-28553972.jpeg?auto=compress&cs=tinysrgb&w=2000&q=92";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetchProductBySlug("kashmiri-walnuts")
      .then((result) => { if (alive) { setProduct(result); setSelectedVariantId(result?.variants?.find((v) => v.size.toLowerCase() === "500 g")?.id || result?.variants?.[0]?.id || ""); } })
      .catch((error) => { console.error("Unable to load Kashurmewa product", error); if (alive) setLoadError(true); })
      .finally(() => { if (alive) setLoading(false); });
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
    } catch {}
    return () => { alive = false; };
  }, []);

  const selectedVariant = product?.variants.find((variant) => variant.id === selectedVariantId) || product?.variants.find((variant) => variant.size.toLowerCase() === "500 g") || product?.variants[0];

  function addToBag(variant: ProductVariant) {
    if (!product || variant.stock <= 0) { setNotice("This pack is currently unavailable."); return; }
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const existing = cart.find((item: { variantId: string }) => item.variantId === variant.id);
      if (existing) {
        if (Number(existing.qty) >= variant.stock) { setNotice("Your bag already has the available quantity for this pack."); return; }
        existing.qty = Number(existing.qty) + 1;
      } else cart.push({ productId: product.id, variantId: variant.id, qty: 1 });
      localStorage.setItem("kashurmewa-cart", JSON.stringify(cart));
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
      setNotice(variant.size + " added to your bag");
      window.setTimeout(() => setNotice(""), 2600);
    } catch { setNotice("We couldn't update your bag. Please try again."); }
  }

  return (
    <main className="km-store">
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="ks-toast" role="status">{notice}<Link href="/cart"> View bag →</Link></div>}

      <section className="ks-hero" aria-label="Kashurmewa walnuts">
        <div className="ks-hero-copy">
          <span className="ks-kicker"><i /> NATURE’S FINEST FROM THE VALLEYS</span>
          <h1>The pure taste<br /><em>of the valleys.</em></h1>
          <p>Whole walnuts in their natural hard shells, carefully packed for everyday rituals. Naturally distinctive, beautifully simple, and always sold in shell.</p>
          <div className="ks-actions">
            <Link className="ks-button" href="#shop">Shop whole walnuts <ArrowRight size={17} /></Link>
            <span className="ks-price-note">{loading ? "Explore our walnut collection" : product?.variants?.length ? `Packs from ${money(Math.min(...product.variants.map(v => v.price_inr)))}` : "Thoughtfully packed walnuts"}</span>
          </div>
          <div className="ks-proof">
            <span><Leaf size={18}/><b>100% Natural</b></span>
            <span><PackageCheck size={18}/><b>In-shell freshness</b></span>
            <span><Truck size={18}/><b>Carefully packed</b></span>
          </div>
        </div>
        <div className="ks-hero-media">
          <img src={WALNUT_HERO} alt="A close-up of whole walnuts in their natural brown shells" />
          <div className="ks-image-label"><span>THE KASHURMEWA EDIT</span><b>Whole walnuts. Natural shells. Carefully packed.</b></div>
          <div className="ks-round-label">GOODNESS<br/><strong>BY NATURE</strong><br/>KASHURMEWA</div>
        </div>
      </section>

      <section className="ks-benefit-bar" aria-label="Shopping benefits">
        <div><ShieldCheck/><span><b>Clear pack options</b><small>Choose what suits your home</small></span></div>
        <div><PackageCheck/><span><b>Considered packaging</b><small>Presented with care</small></span></div>
        <div><Truck/><span><b>Online ordering</b><small>Delivery details at checkout</small></span></div>
        <div><ShoppingBag/><span><b>Simple shopping</b><small>Browse, choose and add to bag</small></span></div>
      </section>

      <section className="ks-shop" id="shop">
        <div className="ks-heading">
          <div><span className="ks-kicker">THE SIGNATURE COLLECTION</span><h2>Whole walnuts, <em>still in shell.</em></h2><p>Shop whole walnuts in shell—not shelled kernels—in the pack size that suits your home.</p></div>
          <Link className="ks-inline-link" href="/shop">Explore the shop <ArrowUpRight size={16}/></Link>
        </div>
        {loading ? <div className="ks-state">Loading current pack sizes and prices…</div> :
          loadError ? <div className="ks-state">We couldn’t load the current catalogue. Please visit the <Link href="/shop">shop</Link>.</div> :
          product?.variants?.length && selectedVariant ? (
            <div className="ks-featured-product">
              <Link className="ks-featured-image" href={`/products/${product.slug}`} aria-label="View whole walnuts in shell">
                <img src={WALNUT_DETAIL} alt="Whole walnuts in their natural hard shells, with one cracked walnut shown as a serving detail" />
                <span className="ks-featured-stamp">WHOLE WALNUTS<br/><strong>IN SHELL</strong></span>
              </Link>
              <div className="ks-featured-details">
                <span className="ks-kicker">THE SIGNATURE HARVEST</span>
                <h3>Kashmiri walnuts <em>in shell</em></h3>
                <p>One product. Your preferred pack size. Every pack contains whole walnuts in their natural hard shells—not loose kernels.</p>
                <div className="ks-weight-heading"><strong>Choose pack size</strong><span>Available sizes</span></div>
                <div className="ks-weight-options" role="group" aria-label="Choose walnut pack size">
                  {product.variants.map((variant) => (
                    <button key={variant.id} type="button" className={selectedVariant.id === variant.id ? "ks-weight-option is-selected" : "ks-weight-option"} aria-pressed={selectedVariant.id === variant.id} onClick={() => setSelectedVariantId(variant.id)} disabled={variant.stock <= 0}>
                      <strong>{variant.size}</strong><span>{money(variant.price_inr)}</span><small>{variant.stock > 0 ? "Available" : "Sold out"}</small>
                    </button>
                  ))}
                </div>
                <div className="ks-featured-purchase">
                  <div><small>YOUR SELECTION</small><strong>{selectedVariant.size}</strong><span>{money(selectedVariant.price_inr)}</span></div>
                  <button className="ks-add-button" disabled={selectedVariant.stock <= 0} onClick={() => addToBag(selectedVariant)}>
                    {selectedVariant.stock > 0 ? <>Add to bag <ShoppingBag size={16}/></> : <>Currently unavailable</>}
                  </button>
                </div>
                <div className="ks-stock"><span className={selectedVariant.stock > 0 ? "ks-stock-dot" : "ks-stock-dot ks-sold-out"}/>{selectedVariant.stock > 0 ? "Available to order" : "Out of stock"}</div>
              </div>
            </div>
          ) : <div className="ks-state">Our collection is being prepared. Please check back soon.</div>}
      </section>

      <section className="ks-story" id="story">
        <div className="ks-story-photo"><img src={ORCHARD_IMAGE} alt="Walnuts growing on a tree in an orchard"/><span>ROOTED IN NATURE</span></div>
        <div className="ks-story-copy"><span className="ks-kicker">A BRAND WITH ROOTS</span><h2>Keep it simple.<br/>Keep it <em>natural.</em></h2><p>Kashurmewa brings the familiar goodness of walnuts into everyday life. We believe buying well should feel simple: clear pack sizes, transparent pricing and a considered experience from browsing to bag.</p><Link className="ks-button ks-button-light" href="/about">Meet Kashurmewa <ArrowRight size={16}/></Link></div>
      </section>

      <section className="ks-origin" id="origin">
        <div className="ks-origin-copy"><span className="ks-kicker">A MOMENT FOR YOURSELF</span><h2>Little rituals.<br/><em>Lasting goodness.</em></h2><p>Crack a few walnuts for your breakfast, add them to a favourite recipe, or bring a bowl to the table to share. A simple ingredient can be part of so many everyday moments.</p><Link href="/shop" className="ks-origin-link">SHOP THE WALNUTS <ArrowRight size={15}/></Link></div>
        <div className="ks-origin-photo"><img src={WALNUT_DETAIL} alt="A close-up of natural walnuts ready to enjoy"/><span>THE EVERYDAY WALNUT</span></div>
      </section>

      <section className="ks-why" id="faq">
        <div className="ks-heading"><div><span className="ks-kicker">THE KASHURMEWA DIFFERENCE</span><h2>Thoughtful from <em>the start.</em></h2></div></div>
        <div className="ks-why-grid">
          <div><span>01</span><Sprout/><h3>A product-led approach</h3><p>We keep the focus on walnuts, not an endless catalogue of distractions.</p></div>
          <div><span>02</span><PackageCheck/><h3>Clear choices</h3><p>Compare available pack sizes and current prices before adding to your bag.</p></div>
          <div><span>03</span><ShoppingBag/><h3>A simple experience</h3><p>Browse the collection, choose your pack and review your order in the cart.</p></div>
        </div>
      </section>

      <section className="ks-final-cta"><div><span className="ks-kicker">YOUR PANTRY, REIMAGINED</span><h2>Make room for <em>something good.</em></h2></div><Link className="ks-button" href="#shop">Find your pack <ArrowRight size={17}/></Link></section>

      <footer className="ks-footer">
        <div className="ks-footer-main"><div className="ks-footer-brand"><span className="ks-wordmark">kashur<span>mewa</span></span><p>Walnuts for everyday rituals, thoughtfully brought to your table.</p></div><div><small>SHOP</small><Link href="/shop">All walnuts</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div><div><small>DISCOVER</small><Link href="/about">Our story</Link><a href="#shop">Pack sizes</a><a href="#origin">Everyday inspiration</a></div><div className="ks-footer-note"><b>Goodness, grown naturally.</b><p>Thank you for shopping Kashurmewa.</p></div></div>
        <div className="ks-footer-bottom"><span>© {new Date().getFullYear()} Kashurmewa</span><span>Made for everyday rituals.</span></div>
      </footer>
    </main>
  );
}

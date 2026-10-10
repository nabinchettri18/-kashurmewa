"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Leaf, PackageCheck, ShieldCheck, ShoppingBag, Sprout, Truck } from "lucide-react";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import "./kashurmewa-storefront.css";

const WALNUT_HERO = "https://images.pexels.com/photos/36040913/pexels-photo-36040913.jpeg?auto=compress&cs=tinysrgb&w=1800";
const WALNUT_DETAIL = "https://images.pexels.com/photos/37309469/pexels-photo-37309469.jpeg?auto=compress&cs=tinysrgb&w=1200";
const ORCHARD_IMAGE = "https://images.pexels.com/photos/17131011/pexels-photo-17131011.jpeg?auto=compress&cs=tinysrgb&w=1400";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetchProductBySlug("kashmiri-walnuts")
      .then((result) => { if (alive) setProduct(result); })
      .catch((error) => { console.error("Unable to load Kashurmewa product", error); if (alive) setLoadError(true); })
      .finally(() => { if (alive) setLoading(false); });
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
    } catch {}
    return () => { alive = false; };
  }, []);

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
      <div className="ks-announcement"><span>THE EVERYDAY WALNUT, REIMAGINED</span><span>Free delivery on orders above ₹999 <ArrowRight size={12} /></span></div>
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="ks-toast" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}

      <section className="ks-hero">
        <div className="ks-hero-copy">
          <span className="ks-kicker"><i /> A LITTLE MORE NATURE, EVERY DAY</span>
          <h1>Some things<br />are simply <em>worth cracking.</em></h1>
          <p>Meet Kashurmewa: whole Kashmiri walnuts in shell, thoughtfully presented for slow mornings, family tables and the little rituals that make a day.</p>
          <div className="ks-actions">
            <Link className="ks-button" href="#shop">Find your pack <ArrowRight size={17} /></Link>
            <Link className="ks-text-link" href="/about">The Kashurmewa story <ArrowUpRight size={15} /></Link>
          </div>
          <div className="ks-hero-note"><span className="ks-note-mark">✳</span><span><b>Simple by nature.</b><small>One considered product. A few good choices.</small></span></div>
        </div>
        <div className="ks-hero-media">
          <img src={WALNUT_HERO} alt="Whole walnuts in their natural shells, photographed close up" />
          <div className="ks-photo-index"><span>01 / THE SIGNATURE</span><span>WHOLE WALNUTS · IN SHELL</span></div>
          <div className="ks-hero-stamp"><span>THE</span><strong>WALNUT</strong><span>RITUAL</span><i>✳</i></div>
        </div>
      </section>

      <section className="ks-benefit-bar" aria-label="Shopping information">
        <div><ShieldCheck/><span><b>Clear prices</b><small>Current catalogue pricing</small></span></div>
        <div><PackageCheck/><span><b>Thoughtful presentation</b><small>Made for your pantry</small></span></div>
        <div><Truck/><span><b>Delivery across India</b><small>Details shown before ordering</small></span></div>
        <div><ShoppingBag/><span><b>Cash on delivery</b><small>Available at checkout</small></span></div>
      </section>

      <section className="ks-shop" id="shop">
        <div className="ks-heading">
          <div><span className="ks-kicker">THE SIGNATURE COLLECTION</span><h2>Choose your <em>good thing.</em></h2><p>Same lovely walnut. A pack size for your kind of everyday.</p></div>
          <Link className="ks-inline-link" href="/shop">Explore the shop <ArrowUpRight size={16}/></Link>
        </div>
        {loading ? <div className="ks-state"><span className="ks-loading-dot" /> Loading current pack sizes and prices…</div> :
          loadError ? <div className="ks-state" role="alert">We couldn’t load the live catalogue. Please try the <Link href="/shop">shop page</Link> or come back shortly.</div> :
          product?.variants?.length ? (
            <div className="ks-products">
              {product.variants.map((variant, index) => (
                <article className={"ks-product-card " + (index === 1 ? "ks-product-featured" : "")} key={variant.id}>
                  <Link className="ks-product-image" href={"/products/" + product.slug} aria-label={"View " + variant.size + " Kashmiri walnuts"}>
                    <img src={product.images?.[index % Math.max(product.images.length, 1)]?.url || (index === 0 ? WALNUT_DETAIL : WALNUT_HERO)} alt={product.name} loading="lazy" />
                    <span>{index === 0 ? "THE EVERYDAY PICK" : index === 1 ? "A LITTLE EXTRA" : "FOR SHARING"}</span>
                    <i><ArrowUpRight size={18}/></i>
                  </Link>
                  <div className="ks-product-info">
                    <div className="ks-product-title"><div><small>KASHURMEWA · SIGNATURE WALNUTS</small><Link href={"/products/" + product.slug}><h3>Whole Kashmiri walnuts</h3></Link></div><strong>{money(variant.price_inr)}</strong></div>
                    <p>{variant.size} pack <span>·</span> In-shell walnuts</p>
                    <div className="ks-card-bottom">
                      <button className="ks-add-button" type="button" disabled={variant.stock <= 0} onClick={() => addToBag(variant)}>{variant.stock > 0 ? <>Add to bag <ShoppingBag size={15}/></> : <>Sold out</>}</button>
                      <span className="ks-stock"><i className={variant.stock > 0 ? "ks-stock-dot" : "ks-stock-dot ks-sold-out"}/>{variant.stock > 0 ? "In stock" : "Unavailable"}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="ks-state">The collection is being prepared. Please check back soon or <Link href="/contact">contact us</Link>.</div>}
        <p className="ks-catalogue-note"><Check size={14}/> Prices and availability are read from the live catalogue. Final delivery charges appear in your bag.</p>
      </section>

      <section className="ks-manifesto">
        <div className="ks-manifesto-art"><img src={WALNUT_DETAIL} alt="A close, tactile view of whole walnuts" /><span>CRACK OPEN<br/>A SMALL MOMENT.</span><i>✳</i></div>
        <div className="ks-manifesto-copy"><span className="ks-kicker">A SMALL DAILY RITUAL</span><h2>Good things don’t need to be <em>complicated.</em></h2><p>A bowl on the table. A little pause between things. Something wholesome to share. We believe the best pantry staples earn their place through simplicity, usefulness and care in the details.</p><Link className="ks-button ks-button-outline" href={"/products/" + (product?.slug || "kashmiri-walnuts")}>Discover the walnuts <ArrowRight size={16}/></Link></div>
      </section>

      <section className="ks-story" id="story">
        <div className="ks-story-photo"><img src={ORCHARD_IMAGE} alt="A leafy orchard setting" loading="lazy"/><span>ROOTED IN A DISTINCTIVE HARVEST</span></div>
        <div className="ks-story-copy"><span className="ks-kicker">A BRAND WITH ROOTS</span><h2>From a beloved harvest to <em>your home.</em></h2><p>Kashurmewa is built around one simple idea: bring the character of Kashmiri walnuts into everyday life with clear choices and thoughtful presentation. No complicated catalogue. Just a product worth getting to know.</p><Link className="ks-text-link" href="/about">Get to know us <ArrowRight size={15}/></Link></div>
      </section>

      <section className="ks-why">
        <div className="ks-heading"><div><span className="ks-kicker">THE KASHURMEWA WAY</span><h2>Considered at <em>every step.</em></h2></div><p>We keep the experience as simple as the product should be.</p></div>
        <div className="ks-why-grid">
          <div><span className="ks-step">01</span><Sprout/><h3>Keep it simple</h3><p>A focused product range that makes choosing easier.</p></div>
          <div><span className="ks-step">02</span><PackageCheck/><h3>Know what you’re buying</h3><p>See pack sizes, live prices and availability before ordering.</p></div>
          <div><span className="ks-step">03</span><Truck/><h3>Shop with clarity</h3><p>Review delivery charges and order details before you confirm.</p></div>
        </div>
      </section>

      <section className="ks-final-cta"><div><span className="ks-kicker">YOUR PANTRY, A LITTLE MORE THOUGHTFUL</span><h2>Ready to crack <em>into something good?</em></h2></div><Link className="ks-button" href="#shop">Shop Kashurmewa <ArrowRight size={17}/></Link></section>

      <footer className="ks-footer">
        <div className="ks-footer-main">
          <div className="ks-footer-brand"><Link href="/" className="ks-wordmark">kashur<span>mewa</span></Link><p>Whole Kashmiri walnuts, thoughtfully brought to your everyday.</p><Link className="ks-footer-contact" href="/contact">Questions? Talk to us <ArrowUpRight size={14}/></Link></div>
          <div><small>SHOP</small><Link href="/shop">All walnuts</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div>
          <div><small>OUR WORLD</small><Link href="/about">Our approach</Link><Link href="/#story">Our story</Link><Link href="/contact">Contact us</Link></div>
          <div><small>HELP & POLICIES</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns & refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div>
        </div>
        <div className="ks-footer-bottom"><span>© Kashurmewa</span><span>THE TASTE OF KASHMIR.</span><Link href="/policies/food-safety">Food safety information</Link></div>
      </footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Leaf, PackageCheck, ShieldCheck, ShoppingBag, Sprout, Truck } from "lucide-react";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import "./kashurmewa-home.css";

// Curated imagery: walnut product photography for the storefront, walnut orchard/harvest photography for the brand story.
const WALNUT_HERO = "https://images.pexels.com/photos/36040913/pexels-photo-36040913.jpeg?auto=compress&cs=tinysrgb&w=1800";
const WALNUT_DETAIL = "https://images.pexels.com/photos/37309469/pexels-photo-37309469.jpeg?auto=compress&cs=tinysrgb&w=1400";
const ORCHARD_IMAGE = "https://images.pexels.com/photos/17131011/pexels-photo-17131011.jpeg?auto=compress&cs=tinysrgb&w=1600";
const HARVEST_IMAGE = "https://images.pexels.com/photos/29128546/pexels-photo-29128546.jpeg?auto=compress&cs=tinysrgb&w=1600";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetchProductBySlug("kashmiri-walnuts").then((result) => { if (alive) setProduct(result); })
      .catch((error) => { console.error("Unable to load Kashurmewa product", error); if (alive) setLoadError(true); })
      .finally(() => { if (alive) setLoading(false); });
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
    } catch {}
    return () => { alive = false; };
  }, []);

  // Use known-relevant curated images for decorative sections. Supabase remains the source of product, price and stock data.
  const heroImage = WALNUT_HERO;
  const productImage = WALNUT_DETAIL;

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
      window.setTimeout(() => setNotice(""), 2800);
    } catch { setNotice("We couldn't update your bag. Please try again."); }
  }

  return (
    <main className="km-home">
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="km-toast" role="status">{notice}</div>}
      <section className="km-hero">
        <div className="km-hero-copy">
          <span className="km-eyebrow"><i /> A LITTLE PIECE OF THE MOUNTAINS</span>
          <h1>Goodness,<br />grown <em>naturally.</em></h1>
          <p>Thoughtfully packed Kashmiri walnuts for everyday rituals, shared tables, and thoughtful gifting.</p>
          <div className="km-hero-actions">
            <Link className="km-button" href="/shop">Explore walnuts <ArrowRight size={16} /></Link>
            <a className="km-text-link" href="#story">Discover our story <ArrowUpRight size={15} /></a>
          </div>
          <div className="km-hero-notes">
            <span><Leaf size={19} /><b>One simple ingredient</b><small>Walnuts in shell</small></span>
            <span><PackageCheck size={19} /><b>Carefully packed</b><small>Made for your pantry</small></span>
            <span><Truck size={19} /><b>Delivered to you</b><small>Across India</small></span>
          </div>
        </div>
        <div className="km-hero-photo">
          <img src={heroImage} alt="Close-up of whole walnuts arranged in a rustic wooden bowl" />
          <div className="km-photo-stamp"><span>FROM THE</span><strong>orchard</strong><span>TO YOUR HOME</span><b>✳</b></div>
          <div className="km-image-caption"><span>01 / THE HARVEST</span><span>Natural. Honest. Kashurmewa.</span></div>
        </div>
      </section>
      <section className="km-intro-strip" aria-label="Kashurmewa values">
        <span><Sprout size={17} /> A taste of the mountains</span><i />
        <span><ShieldCheck size={17} /> Simple, honest ingredients</span><i />
        <span><PackageCheck size={17} /> Packed with care</span>
      </section>
      <section className="km-collection" id="shop">
        <div className="km-section-heading">
          <div><span className="km-eyebrow">THE KASHURMEWA COLLECTION</span><h2>Walnuts for every <em>moment.</em></h2></div>
          <p>One treasured harvest, available in a size that suits your home.</p>
        </div>
        <div className="km-collection-grid">
          <Link className="km-collection-feature" href="/shop">
            <img src={productImage} alt="Kashmiri walnuts in shell" />
            <div className="km-feature-shade" />
            <div className="km-feature-content"><span>THE SIGNATURE HARVEST</span><h3>Whole Kashmiri<br />walnuts.</h3><p>Explore the collection <ArrowUpRight size={15} /></p></div>
          </Link>
          <div className="km-size-panel">
            <span className="km-eyebrow">CHOOSE YOUR PACK</span>
            <h3>Small ritual.<br /><em>Beautifully simple.</em></h3>
            <p>Choose your preferred weight. Current prices and availability are shown directly from our catalogue.</p>
            {loading ? <div className="km-state">Loading today’s selection…</div> :
              loadError ? <div className="km-state">We couldn’t load the latest packs. Please visit the <Link href="/shop">shop</Link>.</div> :
              product?.variants?.length ? (
                <div className="km-pack-list">
                  {product.variants.map((variant) => (
                    <div className="km-pack-row" key={variant.id}>
                      <div><strong>{variant.size}</strong><small>{variant.stock > 0 ? "Available to order" : "Currently unavailable"}</small></div>
                      <b>{money(variant.price_inr)}</b>
                      <button disabled={variant.stock <= 0} onClick={() => addToBag(variant)} aria-label={"Add " + variant.size + " to bag"}><ShoppingBag size={15} /></button>
                    </div>
                  ))}
                </div>
              ) : <div className="km-state">Our walnut collection is being prepared. Please check back soon.</div>}
            <Link href="/shop" className="km-underlined-link">View all details <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
      <section className="km-benefits">
        <div className="km-benefit-image"><img src={ORCHARD_IMAGE} alt="Green walnuts growing naturally on a walnut tree branch" /><div><span>THE EVERYDAY GOOD</span><strong>Small bites.<br /><em>Grounded living.</em></strong></div></div>
        <div className="km-benefit-copy">
          <span className="km-eyebrow">NATURE NEEDS NO EXTRAS</span>
          <h2>A simple ingredient.<br /><em>So many ways to enjoy.</em></h2>
          <p>Add walnuts to breakfast, bake them into something special, or enjoy them as part of your everyday snack routine.</p>
          <div className="km-benefit-list">
            <div><span>01</span><div><b>Everyday versatility</b><small>Enjoy on their own or add to meals and recipes.</small></div></div>
            <div><span>02</span><div><b>Naturally satisfying</b><small>A classic pantry staple with a rich, earthy taste.</small></div></div>
            <div><span>03</span><div><b>Made for sharing</b><small>A thoughtful addition to your home or gifting basket.</small></div></div>
          </div>
        </div>
      </section>
      <section className="km-why">
        <div className="km-why-photo"><img src={ORCHARD_IMAGE} alt="Walnut trees and natural foliage in an orchard" /></div>
        <div className="km-why-copy"><span className="km-eyebrow">WHY KASHURMEWA</span><h2>Rooted in nature.<br /><em>Made for your home.</em></h2><p>We keep the experience simple: a product rooted in a distinctive harvest, clear pack choices, and a considered presentation from our brand to your table.</p><Link className="km-light-button" href="/about">Meet Kashurmewa <ArrowRight size={15} /></Link></div>
      </section>
      <section className="km-story" id="story">
        <div className="km-story-copy"><span className="km-eyebrow">OUR STORY · OUR ORIGIN</span><h2>A little closer to<br /><em>where it begins.</em></h2><p>Kashurmewa celebrates the character of Kashmiri walnuts with an understated, thoughtful approach. We believe good products deserve honest presentation, careful packing, and a place in the everyday.</p><a className="km-underlined-link" href="#origin">Explore our roots <ArrowRight size={15} /></a></div>
        <div className="km-story-image" id="origin"><img src={HARVEST_IMAGE} alt="Traditional walnut harvesting in an orchard" /><span>THE KASHURMEWA WAY · EST. 2026</span></div>
      </section>
      <section className="km-faq" id="faq">
        <div><span className="km-eyebrow">A FEW GOOD QUESTIONS</span><h2>Before it reaches<br /><em>your doorstep.</em></h2></div>
        <div className="km-faq-items">
          <details><summary>What do you sell? <span>+</span></summary><p>Kashurmewa currently focuses on Kashmiri walnuts in shell. Available pack sizes are listed in the shop.</p></details>
          <details><summary>How do I choose a pack size? <span>+</span></summary><p>Compare the pack weights and current prices in the collection section, then choose the size that works for your home.</p></details>
          <details><summary>Where can I check delivery and order details? <span>+</span></summary><p>Visit the shop or cart to review the available options before placing an order.</p></details>
        </div>
      </section>
      <footer className="km-footer">
        <div className="km-footer-brand"><span className="km-footer-logo">kashur<span>mewa</span></span><p>A little piece of the mountains, thoughtfully brought to your home.</p></div>
        <div><small>EXPLORE</small><Link href="/shop">Shop walnuts</Link><Link href="/about">Our story</Link><Link href="/account">My account</Link></div>
        <div><small>YOUR ORDER</small><Link href="/cart">Shopping bag</Link><Link href="/account">Order details</Link></div>
        <div className="km-footer-cta"><span>GOODNESS, GROWN NATURALLY.</span><Link href="/shop">Find your pack <ArrowUpRight size={15} /></Link></div>
        <div className="km-footer-bottom"><span>© {new Date().getFullYear()} Kashurmewa</span><span>Thoughtfully presented. Naturally inspired.</span></div>
      </footer>
    </main>
  );
}

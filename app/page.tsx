"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Leaf, PackageCheck, ShieldCheck, ShoppingBag, Sprout, Truck } from "lucide-react";
import { fetchAllProducts, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import "./kashurmewa-storefront.css";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

type CartLine = { productId: string; variantId: string; qty: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetchAllProducts()
      .then((result) => { if (alive) setProducts(result); })
      .catch((error) => { console.error("Unable to load Kashurmewa catalogue", error); if (alive) setLoadError(true); })
      .finally(() => { if (alive) setLoading(false); });
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
    } catch {}
    return () => { alive = false; };
  }, []);

  const variants = useMemo(
    () => products.flatMap((product) => product.variants.map((variant) => ({ product, variant }))),
    [products],
  );
  const leadProduct = products[0] ?? null;
  const heroImage = leadProduct?.images[0]?.url;
  const storyImage = leadProduct?.images[1]?.url || heroImage;
  const lowestPrice = variants.length ? Math.min(...variants.map(({ variant }) => variant.price_inr)) : null;

  function addToBag(product: Product, variant: ProductVariant) {
    if (variant.stock <= 0) { setNotice("This pack is currently unavailable."); return; }
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]") as CartLine[];
      const existing = cart.find((item) => item.variantId === variant.id);
      if (existing) {
        if (Number(existing.qty) >= variant.stock) { setNotice("Your bag already has the available quantity for this pack."); return; }
        existing.qty = Number(existing.qty) + 1;
      } else cart.push({ productId: product.id, variantId: variant.id, qty: 1 });
      localStorage.setItem("kashurmewa-cart", JSON.stringify(cart));
      setCartCount(cart.reduce((sum, item) => sum + Number(item.qty || 0), 0));
      setNotice(`${variant.size} · ${product.name} added to your bag`);
      window.setTimeout(() => setNotice(""), 2600);
    } catch { setNotice("We couldn't update your bag. Please try again."); }
  }

  return (
    <main className="km-store ks-editorial">
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="ks-toast" role="status">{notice}<Link href="/cart"> View bag →</Link></div>}

      <section className="ks-hero" aria-label="Kashurmewa — The Taste of Kashmir">
        <div className="ks-hero-copy">
          <span className="ks-kicker"><i /> KASHURMEWA · THE TASTE OF KASHMIR</span>
          <h1>A taste of<br /><em>where we belong.</em></h1>
          <p>Rooted in the orchards of Kashmir. Made for the moments that bring us together. Discover walnuts chosen with care and brought to your table with a sense of place.</p>
          <div className="ks-actions">
            <Link className="ks-button" href="#collection">Discover the collection <ArrowRight size={17} /></Link>
            <span className="ks-price-note">{loading ? "A thoughtful collection, coming into view" : lowestPrice !== null ? `Packs from ${money(lowestPrice)}` : "A story rooted in nature"}</span>
          </div>
          <div className="ks-proof">
            <span><Leaf size={18}/><b>Rooted in nature</b></span>
            <span><PackageCheck size={18}/><b>Packed with care</b></span>
            <span><Truck size={18}/><b>Delivered to you</b></span>
          </div>
        </div>
        <div className={`ks-hero-media ${heroImage ? "" : "ks-media-empty"}`}>
          {heroImage ? <img src={heroImage} alt={leadProduct?.images[0]?.alt_text || leadProduct?.name || "Kashurmewa product"} /> : <div className="ks-image-placeholder"><span>KASHURMEWA</span><b>The Taste of Kashmir</b><small>Upload your first product photograph from the admin dashboard.</small></div>}
          <div className="ks-image-label"><span>FROM OUR COLLECTION</span><b>From Kashmir, with care.</b></div>
          <div className="ks-round-label">ROOTED<br/><strong>IN NATURE</strong><br/>KASHURMEWA</div>
        </div>
      </section>

      <section className="ks-benefit-bar" aria-label="Our approach">
        <div><ShieldCheck/><span><b>Honest product details</b><small>Know what you are choosing</small></span></div>
        <div><PackageCheck/><span><b>Thoughtful packaging</b><small>Prepared with care</small></span></div>
        <div><Truck/><span><b>Delivery across India</b><small>Shipping details at checkout</small></span></div>
        <div><ShoppingBag/><span><b>Simple shopping</b><small>A considered experience</small></span></div>
      </section>

      <section className="ks-collection-intro" id="story">
        <span className="ks-kicker"><i /> A PLACE, A HARVEST, A SHARED TABLE</span>
        <h2>Not just a flavour.<br/><em>A feeling of Kashmir.</em></h2>
        <p>Some tastes stay with you. The crunch of a walnut, the warmth of a shared table, the quiet beauty of a place shaped by seasons. Kashurmewa brings that sense of place into everyday rituals.</p>
      </section>

      <section className="ks-shop" id="collection">
        <div className="ks-heading">
          <div><span className="ks-kicker">THE KASHURMEWA COLLECTION</span><h2>Discover <em>your favourite.</em></h2><p>Every product, pack size, price and photograph comes from our live catalogue.</p></div>
          <Link className="ks-inline-link" href="/shop">Explore the shop <ArrowUpRight size={16}/></Link>
        </div>
        {loading ? <div className="ks-state">Bringing the collection into view…</div> :
          loadError ? <div className="ks-state">We couldn’t load the live collection. Please try again or visit the <Link href="/shop">shop</Link>.</div> :
          !variants.length ? <div className="ks-state">Our collection is being prepared. New products and photographs will appear here once published in the admin dashboard.</div> :
          <div className="ks-products">
            {products.map((product, index) => {
              const image = product.images[0];
              const productVariants = [...product.variants].sort((a, b) => a.price_inr - b.price_inr);
              return (
                <article className="ks-product-card" key={product.id}>
                  <Link className="ks-product-image" href={`/products/${product.slug}`} aria-label={`Explore ${product.name}`}>
                    {image?.url ? <img src={image.url} alt={image.alt_text || product.name} /> : <div className="ks-product-placeholder"><span>KASHURMEWA</span><small>Product photograph coming soon</small></div>}
                    <span className="ks-product-label">THE KASHURMEWA COLLECTION</span>
                    <span className="ks-image-index">{String(index + 1).padStart(2, "0")}</span>
                  </Link>
                  <div className="ks-product-info">
                    <div className="ks-product-title"><div><small>THE TASTE OF KASHMIR</small><h3>{product.name}</h3></div><strong>{productVariants.length ? `From ${money(productVariants[0].price_inr)}` : "Price unavailable"}</strong></div>
                    <p>{product.description || "A thoughtful addition to your everyday table."}</p>
                    {productVariants.length > 0 && <div className="ks-pack-options">{productVariants.map((variant) => (
                      <div className="ks-pack-option" key={variant.id}>
                        <span><b>{variant.size}</b><small>{variant.stock > 0 ? "Available" : "Sold out"}</small></span>
                        <strong>{money(variant.price_inr)}</strong>
                        <button aria-label={`Add ${variant.size} ${product.name} to bag`} disabled={variant.stock <= 0} onClick={() => addToBag(product, variant)}>{variant.stock > 0 ? <ShoppingBag size={16}/> : "—"}</button>
                      </div>
                    ))}</div>}
                    <Link className="ks-view-product" href={`/products/${product.slug}`}>Explore product <ArrowRight size={15}/></Link>
                  </div>
                </article>
              );
            })}
          </div>}
      </section>

      <section className="ks-story">
        <div className={`ks-story-photo ${storyImage ? "" : "ks-media-empty"}`}>
          {storyImage ? <img src={storyImage} alt={leadProduct?.images[1]?.alt_text || "Kashurmewa product detail"} /> : <div className="ks-image-placeholder"><span>KASHURMEWA</span><b>Rooted in nature</b><small>Your uploaded product photography will tell this story.</small></div>}
          <span>ROOTED IN NATURE · MADE FOR SHARING</span>
        </div>
        <div className="ks-story-copy"><span className="ks-kicker">OUR PHILOSOPHY</span><h2>From a place<br/>with <em>a story.</em></h2><p>Kashurmewa celebrates the flavours and feeling of Kashmir through thoughtful products, honest details and a premium experience that feels personal. No noise. No clutter. Just a connection between where something comes from and where it belongs.</p><Link className="ks-button ks-button-light" href="/about">Discover our story <ArrowRight size={16}/></Link></div>
      </section>

      <section className="ks-origin" id="origin">
        <div className="ks-origin-copy"><span className="ks-kicker">A LITTLE MORE MEANING IN EVERYDAY</span><h2>Goodness to savour.<br/><em>Moments to share.</em></h2><p>At breakfast, in a recipe passed around the family, or in a small pause for yourself — make room for the simple pleasures that feel like home.</p><Link href="/shop" className="ks-origin-link">EXPLORE THE COLLECTION <ArrowRight size={15}/></Link></div>
        <div className={`ks-origin-photo ${storyImage ? "" : "ks-media-empty"}`}>{storyImage ? <img src={storyImage} alt={leadProduct?.name || "Kashurmewa collection"} /> : <div className="ks-image-placeholder"><span>KASHURMEWA</span><b>The Taste of Kashmir</b></div>}<span>THE TASTE OF KASHMIR</span></div>
      </section>

      <section className="ks-why" id="faq">
        <div className="ks-heading"><div><span className="ks-kicker">THE KASHURMEWA PROMISE</span><h2>Thoughtful at <em>every step.</em></h2></div></div>
        <div className="ks-why-grid">
          <div><span>01</span><Sprout/><h3>A sense of place</h3><p>A brand story inspired by Kashmir and the care behind what reaches your table.</p></div>
          <div><span>02</span><PackageCheck/><h3>Clarity over clutter</h3><p>Product details, pack options and current prices are shown from the live catalogue.</p></div>
          <div><span>03</span><ShoppingBag/><h3>Made to feel simple</h3><p>Discover, choose your pack and review your order in a straightforward shopping flow.</p></div>
        </div>
      </section>

      <section className="ks-final-cta"><div><span className="ks-kicker">KASHURMEWA · THE TASTE OF KASHMIR</span><h2>Bring a little <em>of Kashmir home.</em></h2></div><Link className="ks-button" href="#collection">Find your favourite <ArrowRight size={17}/></Link></section>

      <footer className="ks-footer">
        <div className="ks-footer-main"><div className="ks-footer-brand"><span className="ks-wordmark">KASHUR<span>MEWA</span></span><p>The Taste of Kashmir. A sense of place, brought to your table.</p></div><div><small>SHOP</small><Link href="/shop">The collection</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div><div><small>DISCOVER</small><Link href="/about">Our story</Link><a href="#origin">The philosophy</a><Link href="/policies/shipping">Shipping</Link></div><div className="ks-footer-note"><b>The taste that feels like home.</b><p>Thank you for being part of the Kashurmewa story.</p></div></div>
        <div className="ks-footer-bottom"><span>© {new Date().getFullYear()} Kashurmewa</span><span>THE TASTE OF KASHMIR</span></div>
      </footer>
    </main>
  );
}

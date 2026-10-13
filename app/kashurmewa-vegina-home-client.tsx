"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Leaf, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import { getHeroProductImage, getProductImages, WALNUT_HERO_FALLBACK, WALNUT_PRODUCT_FALLBACK } from "@/lib/product-images";
import { KashurmewLogo } from "@/components/brand/Logo";
import "./kashurmewa-storefront.css";
import "./kashurmewa-brand.css";
import "./kashurmewa-vegina-home.css";

const heroSlides = [
  {
    eyebrow: "Nature’s finest from the valleys",
    title: <>The pure taste <em>of Kashmir.</em></>,
    copy: "Handpicked Kashmiri walnuts, rich in flavour and made for the everyday moments around your table.",
    image: "https://images.pexels.com/photos/35581352/pexels-photo-35581352.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Walnuts arranged in an editorial food still life",
    button: "Shop now",
  },
  {
    eyebrow: "From nature to your table",
    title: <>A little nature. <em>A lot of goodness.</em></>,
    copy: "A simple, versatile pantry favourite for snacking, sharing, baking and the recipes you make your own.",
    image: "https://images.pexels.com/photos/17765489/pexels-photo-17765489.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "A green orchard setting for the KASHURMEWA story",
    button: "Shop now",
  },
  {
    eyebrow: "The KASHURMEWA selection",
    title: <>Make room for <em>the real thing.</em></>,
    copy: "Choose the pack that suits your home, with live product options and pricing from our catalogue.",
    image: "https://images.pexels.com/photos/34415576/pexels-photo-34415576.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Walnuts on a clean light background",
    button: "Discover our walnuts",
  },
];

const editorialCards = [
  {
    eyebrow: "AT THE TABLE",
    title: "A simple handful, any time of day",
    copy: "Make walnuts part of the small everyday rituals you look forward to.",
    image: "https://images.pexels.com/photos/35581352/pexels-photo-35581352.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "Walnut food still life",
  },
  {
    eyebrow: "IN THE KITCHEN",
    title: "A little crunch goes a long way",
    copy: "Try them over breakfast, folded into baking, or added to your favourite recipes.",
    image: "https://images.pexels.com/photos/34415576/pexels-photo-34415576.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "Whole walnuts photographed on a light background",
  },
  {
    eyebrow: "KEEP IT FRESH",
    title: "Good pantry habits matter",
    copy: "Keep your walnuts sealed and store them in a cool, dry place away from direct sunlight.",
    image: "https://images.pexels.com/photos/17765489/pexels-photo-17765489.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "Orchard greenery in a natural setting",
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function sortedVariants(product: Product) {
  return [...product.variants].sort((a, b) => a.price_inr - b.price_inr);
}

type KashurmewaVeginaHomeProps = { initialProducts: Product[]; catalogueError?: boolean };

export default function KashurmewaVeginaHome({ initialProducts, catalogueError = false }: KashurmewaVeginaHomeProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [loading] = useState(false);
  const [loadError] = useState(catalogueError);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [activePack, setActivePack] = useState("all");

  useEffect(() => {
    const readCart = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
        setCartCount(saved.reduce((sum: number, item: { qty?: number }) => sum + Number(item.qty || 0), 0));
      } catch { setCartCount(0); }
    };
    readCart();
    window.addEventListener("kashurmewa-cart-updated", readCart);
    window.addEventListener("storage", readCart);
    return () => {
      window.removeEventListener("kashurmewa-cart-updated", readCart);
      window.removeEventListener("storage", readCart);
    };
  }, []);

  const product = useMemo(
    () => products.find((item) => item.variants?.length && item.slug === "kashmiri-walnuts") || products.find((item) => item.variants?.length),
    [products],
  );
  const variants = useMemo(() => product ? sortedVariants(product) : [], [product]);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants.find((variant) => variant.stock > 0) || variants[0];
  const heroImage = getHeroProductImage(product?.images, product?.name || "Kashmiri walnuts");
  const productImage = product ? getProductImages(product.images, product.name)[0] : null;
  const slide = heroSlides[slideIndex];

  useEffect(() => {
    if (selectedVariantId && variants.some((variant) => variant.id === selectedVariantId)) return;
    const available = variants.find((variant) => variant.stock > 0) || variants[0];
    if (available) setSelectedVariantId(available.id);
  }, [variants, selectedVariantId]);

  function addToBag(variant: ProductVariant) {
    if (!product || variant.stock <= 0) {
      setNotice("This pack is currently unavailable.");
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const existing = saved.find((item: { variantId: string }) => item.variantId === variant.id);
      if (existing) {
        if (Number(existing.qty) >= variant.stock) {
          setNotice("Your bag already contains the available quantity.");
          return;
        }
        existing.qty = Number(existing.qty) + 1;
      } else {
        saved.push({ productId: product.id, variantId: variant.id, qty: 1 });
      }
      localStorage.setItem("kashurmewa-cart", JSON.stringify(saved));
      window.dispatchEvent(new Event("kashurmewa-cart-updated"));
      setCartCount(saved.reduce((sum: number, item: { qty?: number }) => sum + Number(item.qty || 0), 0));
      setNotice(product.name + " added to your bag.");
      window.setTimeout(() => setNotice(""), 2600);
    } catch {
      setNotice("We couldn't update your bag. Please try again.");
    }
  }

  function moveSlide(direction: number) {
    setSlideIndex((current) => (current + direction + heroSlides.length) % heroSlides.length);
  }

  return (
    <main className="km-store km-brand-home km-vegina-home">
      <div className="km-brand-announcement">
        <span>✦ Premium Kashmiri Walnuts</span>
        <span>✦ Thoughtfully selected for your table</span>
      </div>
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="km-brand-toast" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}

      <section className="kv-hero" aria-label="KASHURMEWA featured collection">
        <img className="kv-hero-image" src={slide.image} alt={slide.alt} fetchPriority="high" onError={(event) => { if (!event.currentTarget.src.includes("35581352")) event.currentTarget.src = WALNUT_HERO_FALLBACK; }} />
        <div className="kv-hero-shade" />
        <div className="kv-hero-copy" key={slideIndex}>
          <span className="kv-eyebrow"><i />{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p>{slide.copy}</p>
          <Link className="kv-button" href={product ? "/products/" + product.slug : "/shop"}>{slide.button}<ArrowRight size={17} /></Link>
          <div className="kv-hero-note"><span>100% WALNUTS</span><span>THE KASHURMEWA SELECTION</span></div>
        </div>
        <div className="kv-hero-product">
          <div className="kv-hero-product-image">
            <img src={heroImage.url || WALNUT_HERO_FALLBACK} alt={heroImage.alt_text || "KASHURMEWA Kashmiri walnuts"} onError={(event) => { event.currentTarget.src = WALNUT_HERO_FALLBACK; }} />
          </div>
          <div className="kv-hero-product-caption"><span>THE SIGNATURE PICK</span><strong>{product?.name || "Kashmiri In-Shell Walnuts"}</strong><Link href={product ? "/products/" + product.slug : "/shop"} aria-label="View walnut product"><ArrowUpRight size={17} /></Link></div>
        </div>
        <div className="kv-slider-controls">
          <button type="button" aria-label="Previous slide" onClick={() => moveSlide(-1)}><ChevronLeft size={17} /></button>
          <div className="kv-slider-dots">{heroSlides.map((item, index) => <button key={item.eyebrow} type="button" aria-label={"Show slide " + (index + 1)} aria-current={index === slideIndex} className={index === slideIndex ? "active" : ""} onClick={() => setSlideIndex(index)} />)}</div>
          <button type="button" aria-label="Next slide" onClick={() => moveSlide(1)}><ChevronRight size={17} /></button>
        </div>
        <span className="kv-hero-counter">0{slideIndex + 1}<i />0{heroSlides.length}</span>
      </section>

      <section className="kv-assurances" aria-label="Shopping information">
        <div><Leaf /><span><strong>100% Natural</strong><small>No additives or preservatives</small></span></div>
        <div><ShieldCheck /><span><strong>Rich in Nutrition</strong><small>Goodness in every bite</small></span></div>
        <div><ShoppingBag /><span><strong>Direct from the Valleys</strong><small>Rooted in regional character</small></span></div>
        <div><Truck /><span><strong>Secure Shopping</strong><small>Clear pack and price information</small></span></div>
      </section>

      <section className="kv-promo-grid" aria-label="Explore KASHURMEWA">
        <Link href="/shop" className="kv-promo kv-promo-one">
          <img src="https://images.pexels.com/photos/35581352/pexels-photo-35581352.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Walnuts styled for a premium pantry" loading="lazy" />
          <span className="kv-promo-shade" />
          <span className="kv-promo-copy"><small>THE SIGNATURE SELECTION</small><strong>Premium<br />Kashmiri Walnuts</strong><i>Shop walnuts <ArrowUpRight size={15} /></i></span>
        </Link>
        <Link href="/about" className="kv-promo kv-promo-two">
          <img src="https://images.pexels.com/photos/17765489/pexels-photo-17765489.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Orchard greenery in a natural setting" loading="lazy" />
          <span className="kv-promo-shade" />
          <span className="kv-promo-copy"><small>FROM OUR VALLEYS TO YOUR HOME</small><strong>From Our Valleys<br />to Your Home</strong><i>Our story <ArrowUpRight size={15} /></i></span>
        </Link>
      </section>

      <section className="kv-pack-discovery" id="packs">
        <div className="kv-section-heading">
          <span>SHOP BY PACK SIZE</span>
          <h2>Choose Your <em>Perfect Pack</em></h2>
          <p>One signature product, available in convenient pack sizes.</p>
        </div>
        <div className="kv-pack-row">
          {[
            { size: "250g", name: "250 g Pack", note: "A little taste to start" },
            { size: "500g", name: "500 g Pack", note: "For your everyday pantry" },
            { size: "1kg", name: "1 kg Pack", note: "For family and sharing" },
          ].map((pack) => {
            const variant = variants.find((item) => item.size.toLowerCase().replace(/\s/g, "") === pack.size.toLowerCase().replace(/\s/g, ""));
            return <button type="button" key={pack.size} className={"kv-pack-card" + (selectedVariant?.id === variant?.id ? " selected" : "")} onClick={() => { if (variant) setSelectedVariantId(variant.id); setActivePack(pack.size); }}>
              <span className="kv-pack-orbit"><img src={productImage?.url || WALNUT_PRODUCT_FALLBACK} alt="" loading="lazy" /></span>
              <small>{pack.size} NET PACK</small><strong>{pack.name}</strong><span>{pack.note}</span>
              <b>{variant ? money(variant.price_inr) : "Check availability"}</b>
              <i>{selectedVariant?.id === variant?.id ? "Selected" : "Choose pack"} <ArrowUpRight size={14} /></i>
            </button>;
          })}
        </div>
      </section>

<section className="kv-trending" id="trending">
        <div className="kv-section-heading kv-heading-row">
          <div><span>THE CURRENT COLLECTION</span><h2>Worth a place <em>on your table.</em></h2></div>
          <Link href="/shop" className="kv-text-link">Shop the collection <ArrowRight size={15} /></Link>
        </div>
        {loading ? <div className="kv-state">Preparing the collection…</div> : loadError ? <div className="kv-state">We couldn’t load the live catalogue. Please try the <Link href="/shop">shop</Link> again shortly.</div> : product ? (
          <div className="kv-trending-grid">
            <article className="kv-product-card">
              <Link href={"/products/" + product.slug} className="kv-product-photo">
                <img src={productImage?.url || WALNUT_PRODUCT_FALLBACK} alt={productImage?.alt_text || product.name} loading="lazy" onError={(event) => { event.currentTarget.src = WALNUT_PRODUCT_FALLBACK; }} />
                <span className="kv-product-tag">THE SIGNATURE</span><span className="kv-product-view"><ArrowUpRight size={18} /></span>
              </Link>
              <div className="kv-product-details"><div className="kv-product-kicker"><span>KASHURMEWA</span><span>{variants.length} pack sizes</span></div><h3>{product.name}</h3><p>Natural in-shell walnuts for snacking, sharing and everyday recipes.</p><strong>From {money(variants.length ? Math.min(...variants.map((item) => item.price_inr)) : 0)}</strong><div className="kv-product-size-list">{variants.map((variant) => <button key={variant.id} type="button" className={selectedVariant?.id === variant.id ? "selected" : ""} onClick={() => setSelectedVariantId(variant.id)}>{variant.size}</button>)}</div><button className="kv-add-button" type="button" disabled={!selectedVariant || selectedVariant.stock <= 0} onClick={() => selectedVariant && addToBag(selectedVariant)}>{selectedVariant?.stock ? "Add to bag" : "Currently unavailable"}<ShoppingBag size={16} /></button></div>
            </article>
            <div className="kv-trending-story"><img src="https://images.pexels.com/photos/34415576/pexels-photo-34415576.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Whole walnuts on a light background" loading="lazy" /><div><span>THE SIMPLE THINGS</span><h3>Real ingredients.<br /><em>Room to enjoy.</em></h3><p>Keep a pantry favourite close at hand, ready for the moments that call for a little crunch.</p><Link href={"/products/" + product.slug}>Discover the walnuts <ArrowRight size={15} /></Link></div></div>
          </div>
        ) : <div className="kv-state">The collection is being prepared. <Link href="/contact">Contact us</Link> if you have a question.</div>}
        <p className="kv-live-note"><Check size={14} /> Live pack options and prices come from the KASHURMEWA catalogue.</p>
      </section>

<section className="kv-deal-banner">
        <img src="https://images.pexels.com/photos/35581352/pexels-photo-35581352.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Walnuts in a warm, natural still life" loading="lazy" />
        <div className="kv-deal-overlay" />
        <div className="kv-deal-copy"><span>GOOD THINGS, IN THEIR OWN TIME</span><h2>A pantry favourite<br /><em>for every season.</em></h2><p>No rush, no fuss — simply choose your pack and make it part of your everyday.</p><Link href="/shop">Explore the collection <ArrowRight size={16} /></Link></div>
        <div className="kv-deal-seal"><Sparkles size={18} /><span>THE</span><strong>KASHURMEWA</strong><span>SELECTION</span></div>
      </section>

<section className="kv-special">
        <div className="kv-section-heading"><span>THE RIGHT PACK FOR YOUR HOME</span><h2>Simple choices. <em>Thoughtfully made.</em></h2><p>Browse the sizes and select the one that fits your table.</p></div>
        <div className="kv-special-tabs" role="group" aria-label="Filter by pack size">
          {[{ id: "all", label: "All packs" }, { id: "250g", label: "250 g" }, { id: "500g", label: "500 g" }, { id: "1kg", label: "1 kg" }].map((tab) => <button type="button" key={tab.id} className={activePack === tab.id ? "active" : ""} onClick={() => { setActivePack(tab.id); const found = variants.find((item) => item.size.toLowerCase().replace(/\s/g, "") === tab.id.toLowerCase().replace(/\s/g, "")); if (found) setSelectedVariantId(found.id); }}>{tab.label}</button>)}
        </div>
        <div className="kv-special-panel">
          <div className="kv-special-image"><img src={productImage?.url || WALNUT_PRODUCT_FALLBACK} alt={productImage?.alt_text || "KASHURMEWA in-shell walnuts"} loading="lazy" onError={(event) => { event.currentTarget.src = WALNUT_PRODUCT_FALLBACK; }} /></div>
          <div className="kv-special-copy"><span>THE SIGNATURE PRODUCT</span><h3>{product?.name || "Kashmiri In-Shell Walnuts"}</h3><p>Whole in-shell walnuts, with pack sizes and prices managed in the live catalogue.</p><div className="kv-special-price">{selectedVariant ? money(selectedVariant.price_inr) : "Price unavailable"}<small>{selectedVariant?.size || "Choose a pack"}</small></div><div className="kv-special-options">{variants.filter((variant) => activePack === "all" || variant.size.toLowerCase().replace(/\s/g, "") === activePack.toLowerCase().replace(/\s/g, "")).map((variant) => <button type="button" key={variant.id} className={selectedVariant?.id === variant.id ? "selected" : ""} onClick={() => setSelectedVariantId(variant.id)}><span>{variant.size}</span><strong>{money(variant.price_inr)}</strong></button>)}</div><button type="button" className="kv-add-button" disabled={!product || !selectedVariant || selectedVariant.stock <= 0} onClick={() => selectedVariant && addToBag(selectedVariant)}>Add selected pack to bag <ShoppingBag size={16} /></button><Link className="kv-text-link" href={product ? "/products/" + product.slug : "/shop"}>View full product details <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>

<section className="kv-nutrition" aria-label="Walnut goodness"><div className="kv-nutrition-photo"><img src="https://images.pexels.com/photos/34415576/pexels-photo-34415576.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Walnuts arranged for serving" loading="lazy" /></div><div className="kv-nutrition-copy"><span>NATURAL NUTRITION</span><h2>The goodness <em>inside.</em></h2><p>Walnuts are a versatile pantry ingredient, ready to enjoy on their own or add a satisfying crunch to everyday meals.</p><div className="kv-nutrition-points"><div><i>♡</i><span><strong>Everyday versatility</strong><small>Enjoy as a snack or add to meals</small></span></div><div><i>✳</i><span><strong>Simple ingredient</strong><small>Whole in-shell walnuts</small></span></div><div><i>◇</i><span><strong>For your pantry</strong><small>Store sealed in a cool, dry place</small></span></div><div><i>❋</i><span><strong>Made for sharing</strong><small>A thoughtful pantry staple</small></span></div></div></div></section>


      <section className="kv-testimonials" aria-label="Our promise to customers">
        <div className="kv-testimonial-heading"><span>A THOUGHTFUL PANTRY, ALWAYS</span><h2>Good things are <em>worth sharing.</em></h2><p>Our promise is simple: honest product details, a considered experience, and a pantry favourite you can make your own.</p></div>
        <div className="kv-testimonial-grid">
          <article><span className="kv-quote-mark">“</span><p>Good food begins with ingredients you feel good about bringing home.</p><small>THE KASHURMEWA PHILOSOPHY</small></article>
          <article><span className="kv-quote-mark">“</span><p>Clear pack sizes, transparent pricing, and the details you need before you order.</p><small>OUR PROMISE TO YOU</small></article>
          <article><span className="kv-quote-mark">“</span><p>A little everyday goodness, selected to share around your own table.</p><small>MADE FOR YOUR TABLE</small></article>
        </div>
      </section>

<section className="kv-values">
        <div className="kv-values-intro"><span>THE KASHURMEWA PROMISE</span><h2>Good food deserves <em>good care.</em></h2><p>We’re building a brand that keeps product information clear, the experience considered, and the details honest.</p></div>
        <div className="kv-values-grid"><div><Leaf /><strong>Inspired by place</strong><p>A brand shaped by regional character and a love of good pantry ingredients.</p></div><div><ShieldCheck /><strong>Honest information</strong><p>Clear pack sizes and catalogue prices, without invented claims or ratings.</p></div><div><ShoppingBag /><strong>Made to shop simply</strong><p>Choose your pack, review your bag, and see order details before checkout.</p></div></div>
      </section>

<section className="kv-journal">
        <div className="kv-section-heading kv-heading-row"><div><span>FROM OUR BLOG</span><h2>Walnut <em>Wisdom.</em></h2></div><Link href="/about" className="kv-text-link">Our point of view <ArrowRight size={15} /></Link></div>
        <div className="kv-journal-grid">{editorialCards.map((card) => <article className="kv-journal-card" key={card.title}><div className="kv-journal-image"><img src={card.image} alt={card.alt} loading="lazy" /></div><div className="kv-journal-copy"><span>{card.eyebrow}</span><h3>{card.title}</h3><p>{card.copy}</p></div></article>)}</div>
      </section>

<section className="kv-newsletter"><div><span>THE TASTE OF KASHMIR</span><h2>Join the KASHURMEWA family</h2><p>Discover thoughtful pantry moments and updates from our collection.</p></div><Link href="/shop">Explore the collection <ArrowRight size={16} /></Link></section>

      <footer className="km-brand-footer kv-footer">
        <div className="km-brand-footer-main">
          <div className="km-brand-footer-about"><KashurmewLogo variant="light" size="lg" /><p>A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.</p><Link href="/contact">Questions? Talk to us <ArrowUpRight size={14} /></Link></div>
          <div><small>EXPLORE</small><Link href="/shop">Shop the collection</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div>
          <div><small>THE BRAND</small><Link href="/about">Our story</Link><Link href="/contact">Contact us</Link></div>
          <div><small>HELP &amp; POLICIES</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns &amp; refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div>
        </div>
        <div className="km-brand-footer-bottom"><span>© KASHURMEWA</span><span>THE TASTE OF KASHMIR.</span><Link href="/policies/food-safety">Food safety information</Link></div>
      </footer>
    </main>
  );
}

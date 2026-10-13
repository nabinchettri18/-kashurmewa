import Link from "next/link";
import { ArrowRight, ArrowUpRight, Leaf, PackageCheck, Sprout } from "lucide-react";
import { NavigationHeader } from "@/components/navigation/Header";
import { KashurmewLogo } from "@/components/brand/Logo";
import { WALNUT_HERO_FALLBACK, WALNUT_PRODUCT_FALLBACK } from "@/lib/product-images";
import "../kashurmewa-storefront.css";
import "../kashurmewa-brand.css";

export default function AboutPage() {
  return (
    <main className="km-store ks-v2-about-page">
      <div className="ks-announcement"><span>THE TASTE OF KASHMIR</span><span>Thoughtfully chosen. Beautifully brought home. <ArrowRight size={12} /></span></div>
      <NavigationHeader />
      <section className="ks-v2-about-hero">
        <img src={WALNUT_HERO_FALLBACK} alt="Walnuts styled for the KASHURMEWA brand story" />
        <div className="ks-v2-about-hero-shade" />
        <div><span className="ks-v2-eyebrow">THE KASHURMEWA APPROACH</span><h1>A little of the valley.<br /><em>A lot of home.</em></h1><p>A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.</p></div>
      </section>
      <section className="ks-v2-about-intro">
        <span className="ks-v2-eyebrow ks-v2-eyebrow-dark">OUR POINT OF VIEW</span>
        <h2>Good things carry<br /><em>a sense of place.</em></h2>
        <p>Kashurmewa begins with a simple idea: the foods we bring home can hold a little more meaning. We are building a thoughtful collection inspired by regional character, familiar rituals and the pleasure of sharing something good.</p>
      </section>
      <section className="ks-v2-about-image-story">
        <div className="ks-v2-about-image"><img src={WALNUT_PRODUCT_FALLBACK} alt="Close-up of walnuts for the signature collection" loading="lazy" /><span>THE SIGNATURE COLLECTION</span></div>
        <div className="ks-v2-about-copy"><span className="ks-v2-eyebrow ks-v2-eyebrow-dark">THE COLLECTION TODAY</span><h2>Start with the familiar.<br /><em>Make it thoughtful.</em></h2><p>Our current collection is the beginning of a broader regional pantry. We focus on making product details, pack sizes, current prices and availability easy to understand—so choosing what belongs in your home feels straightforward.</p><p>Over time, the Kashurmewa world can grow into other regional pantry favourites and considered gifts. We will only present products as available when they are ready to order.</p><Link className="ks-v2-text-link" href="/shop">Explore the current collection <ArrowRight size={16} /></Link></div>
      </section>
      <section className="ks-v2-about-values">
        <div><span>01</span><Sprout /><h3>Rooted in a sense of place</h3><p>Regional inspiration, familiar flavours and the feeling of bringing something meaningful home.</p></div>
        <div><span>02</span><Leaf /><h3>Clear by design</h3><p>Useful product information, live prices and available pack sizes before you place an order.</p></div>
        <div><span>03</span><PackageCheck /><h3>Considered in every detail</h3><p>A calmer experience from discovering the collection to reviewing your order.</p></div>
      </section>
      <section className="ks-v2-about-cta"><span className="ks-v2-eyebrow">THE TASTE OF KASHMIR</span><h2>Discover what’s<br /><em>on the table today.</em></h2><Link className="ks-v2-button" href="/shop">Shop the collection <ArrowRight size={16} /></Link></section>
      <footer className="ks-v2-footer"><div className="ks-v2-footer-main"><div className="ks-v2-footer-brand"><KashurmewLogo variant="light" size="lg" /><p>A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.</p><Link href="/contact">Questions? Get in touch <ArrowUpRight size={14} /></Link></div><div><small>SHOP</small><Link href="/shop">Shop the collection</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div><div><small>THE BRAND</small><Link href="/about">Our story</Link><Link href="/">Home</Link><Link href="/contact">Contact us</Link></div><div><small>HELP & POLICIES</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns & refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div></div><div className="ks-v2-footer-bottom"><span>© Kashurmewa</span><span>THE TASTE OF KASHMIR.</span><Link href="/policies/food-safety">Food safety information</Link></div></footer>
    </main>
  );
}

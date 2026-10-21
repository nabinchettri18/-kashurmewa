import Link from "next/link";
import { KashurmewLogo } from "@/components/brand/Logo";

export default function AboutPage() {
  return (
    <main className="commerce-page">
      <header className="commerce-header">
        <KashurmewLogo variant="dark" size="sm" />
        <nav>
          <Link href="/shop">Shop</Link>
          <Link className="active" href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link className="commerce-bag" href="/cart">
          Bag ↗
        </Link>
      </header>

      <section className="policy-page">
        <div className="policy-header">
          <span className="commerce-eyebrow">OUR HERITAGE</span>
          <h1>
            Crafted by altitude.<br />
            <i>Guided by nature.</i>
          </h1>
          <p className="detail-description">
            Kashurmewa brings authentic Kashmiri dry fruits directly from mountain orchards to households across India.
          </p>
        </div>

        <div className="policy-content">
          <h2>The Kashurmewa Philosophy</h2>
          <p>
            The temperate valleys of Kashmir present ideal agro-climatic conditions for walnut cultivation. High altitudes, cold winters, snowmelt river irrigation, and rich soil produce walnuts with superior oil concentration, crisp kernels, and thin natural shells.
          </p>

          <h2>Natural Quality, Zero Bleaching</h2>
          <p>
            Unlike commercial market walnuts that undergo intense chlorine bleaching for uniform white outer shells, Kashurmewa walnuts are preserved in their natural state. We sort for structural shell integrity, clean manually, and pack them without chemical agents.
          </p>

          <h2>Careful Sourcing & Pan-India Dispatch</h2>
          <p>
            Every batch is batch-checked for net weight, shell hardness, kernel fill percentage, and moisture levels before being sealed in food-grade packaging and dispatched across India.
          </p>
        </div>
      </section>

      <footer className="commerce-footer">
        <KashurmewLogo variant="dark" size="sm" />
        <Link href="/shop">Explore Collection</Link>
        <Link href="/contact">Contact Us</Link>
        <Link href="/policies/food-safety">Food Declarations</Link>
      </footer>
    </main>
  );
}

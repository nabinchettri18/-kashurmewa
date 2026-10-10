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
            Kashurmewa is a focused walnut brand built around one product: walnuts in shell. We aim to make product details, pack sizes and current prices clear before checkout.
          </p>
        </div>

        <div className="policy-content">
          <h2>A product-first approach</h2>
          <p>
            We keep the range focused and the shopping experience straightforward. Each active pack is displayed with its current catalogue price and available stock, so customers can review the details before placing an order.
          </p>

          <h2>Clear product information</h2>
          <p>
            Check the product listing and the label on your delivered pack for its net weight, ingredients, storage guidance, packed-on date and best-before information. If you need clarification before ordering, please contact us.
          </p>

          <h2>Delivery and order details</h2>
          <p>
            Delivery charges and the free-shipping threshold are shown in our shipping policy and at checkout. We only confirm an order after the live catalogue, stock and order details have been checked.
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

import Link from "next/link";
import "../../kashurmewa-brand.css";

export default function ShippingPolicyPage() {
  return (
    <main className="commerce-page">
      <header className="commerce-header">
        <Link className="logo" href="/">
          KASHUR<span>MEWA</span>
        </Link>
        <nav>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link className="commerce-bag" href="/cart">
          Bag ↗
        </Link>
      </header>

      <section className="policy-page">
        <div className="policy-header">
          <span className="commerce-eyebrow">STORE POLICIES</span>
          <h1>
            Shipping &<br />
            <i>Delivery Policy.</i>
          </h1>
        </div>

        <div className="policy-content">
          <h2>Order Processing Timelines</h2>
          <p>
            Orders are prepared after confirmation. Processing time can vary with stock, destination, and operating days; any delay or dispatch update should be confirmed with our team.
          </p>

          <h2>Shipping Charges</h2>
          <p>
            Applicable delivery charges are shown in your bag before you place an order. Please review the delivery fee and final total carefully before confirming checkout. For help with a delivery estimate, contact our team before ordering.
          </p>

          <h2>Estimated Delivery Periods</h2>
          <ul>
            <li>Delivery times depend on destination, courier service, weather, and other conditions. Any time estimate is indicative, not a guarantee.</li>
          </ul>

          <h2>Order Tracking</h2>
          <p>
            Automated email/SMS tracking is not yet configured. If you need an update after placing an order, contact us through the Contact page and include your order reference.
          </p>
        </div>
      </section>

      <footer className="commerce-footer">
        <Link className="logo" href="/">
          KASHUR<span>MEWA</span>
        </Link>
        <Link href="/policies/refund">Return Policy</Link>
        <Link href="/policies/privacy">Privacy Policy</Link>
      </footer>
    </main>
  );
}

import Link from "next/link";

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
            All confirmed Kashurmewa orders are processed and packed within 24 to 48 hours (excluding Sundays and national holidays).
          </p>

          <h2>Shipping Charges & Free Delivery</h2>
          <ul>
            <li><strong>Orders above ₹999 INR:</strong> FREE Pan-India Shipping.</li>
            <li><strong>Orders below ₹999 INR:</strong> Flat ₹99 INR standard delivery charge.</li>
          </ul>

          <h2>Estimated Delivery Periods</h2>
          <ul>
            <li><strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad):</strong> 3 – 5 business days.</li>
            <li><strong>Rest of India & Tier 2/3 Cities:</strong> 5 – 7 business days.</li>
          </ul>

          <h2>Order Tracking</h2>
          <p>
            Once your package is dispatched, a courier tracking reference number will be sent via email or SMS. You can monitor your shipment's journey directly on the courier partner's portal.
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

import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <span className="commerce-eyebrow">PRIVACY PROTECTION</span>
          <h1>
            Privacy Policy &<br />
            <i>Data Protection.</i>
          </h1>
        </div>

        <div className="policy-content">
          <h2>Data Collection & Purpose</h2>
          <p>
            Kashurmewa collects personal information (such as name, email address, shipping address, and phone number) strictly to process orders, deliver shipments, and communicate order status updates.
          </p>

          <h2>Data Security</h2>
          <p>
            We use reasonable technical and organizational safeguards to protect personal information. Checkout currently supports Cash on Delivery only; online payment processing is not enabled. Contact-form messages are stored in our store support database so we can respond to enquiries.
          </p>

          <h2>Third-Party Sharing</h2>
          <p>
            If an order is placed, necessary delivery details may be shared with a delivery provider to fulfil that order. We do not sell customer personal information. Only provide information needed to process your enquiry or order.
          </p>
        </div>
      </section>

      <footer className="commerce-footer">
        <Link className="logo" href="/">
          KASHUR<span>MEWA</span>
        </Link>
        <Link href="/policies/terms">Terms of Service</Link>
        <Link href="/policies/shipping">Shipping Policy</Link>
      </footer>
    </main>
  );
}

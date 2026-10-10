import Link from "next/link";

export default function RefundPolicyPage() {
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
            Returns, Cancellations &<br />
            <i>Refund Policy.</i>
          </h1>
        </div>

        <div className="policy-content">
          <h2>Perishable Food Product Policy</h2>
          <p>
            Due to the fresh, perishable nature of edible dry fruits, opened packages cannot be returned for hygienic reasons. However, we guarantee customer satisfaction if products arrive damaged, defective, or incorrect.
          </p>

          <h2>Damaged or Defective Items</h2>
          <p>
            If an item arrives damaged, defective, or incorrect, contact us through the Contact page as soon as possible, ideally within 48 hours of delivery. Include your order reference and clear photos of the item and packaging so we can review the issue.
          </p>

          <h2>Refund Processing</h2>
          <p>
            Checkout currently supports Cash on Delivery only, and automated refunds are not available. If a refund or other resolution is approved after review, our team will contact you to confirm the arrangement and expected timing. We do not promise a fixed refund timeline before reviewing the case.
          </p>
        </div>
      </section>

      <footer className="commerce-footer">
        <Link className="logo" href="/">
          KASHUR<span>MEWA</span>
        </Link>
        <Link href="/policies/shipping">Shipping Policy</Link>
        <Link href="/policies/terms">Terms of Service</Link>
      </footer>
    </main>
  );
}

import Link from "next/link";

export default function TermsPage() {
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
          <span className="commerce-eyebrow">TERMS OF SERVICE</span>
          <h1>
            Terms &<br />
            <i>Conditions.</i>
          </h1>
        </div>

        <div className="policy-content">
          <h2>Terms of Use</h2>
          <p>
            By accessing and purchasing from Kashurmewa, you agree to comply with our store terms and policies. All content, imagery, and branding are the property of Kashurmewa.
          </p>

          <h2>Pricing & Product Availability</h2>
          <p>
            Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Product availability, pack sizes, and prices are subject to change based on seasonal harvest conditions without prior notice.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the applicable laws of India. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </div>
      </section>

      <footer className="commerce-footer">
        <Link className="logo" href="/">
          KASHUR<span>MEWA</span>
        </Link>
        <Link href="/policies/privacy">Privacy Policy</Link>
        <Link href="/policies/shipping">Shipping Policy</Link>
      </footer>
    </main>
  );
}

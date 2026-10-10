import Link from "next/link";

export default function FoodSafetyPage() {
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
          <span className="commerce-eyebrow">FOOD & PACKAGING DECLARATION</span>
          <h1>
            Food Product &<br />
            <i>Label Declarations.</i>
          </h1>
        </div>

        <div className="policy-content">
          <h2>Product Name & Description</h2>
          <p>
            <strong>Product:</strong> Kashmiri In-Shell Walnuts (Juglans regia).<br />
            <strong>Category:</strong> Dry Fruits / Nuts.<br />
            <strong>Ingredients:</strong> In-shell walnuts. Confirm the final ingredient and processing declarations against the actual supplier and physical product label before sale.
          </p>

          <h2>Net Weight & Shell Weight Notice</h2>
          <p>
            Walnuts are sold with natural hard shells intact. Net weight printed on packaging indicates total product weight including natural shells. In-shell walnuts provide superior physical kernel protection against environmental moisture and oxidation.
          </p>

          <h2>Allergen Warning</h2>
          <p>
            <strong>Contains Tree Nuts (Walnuts).</strong> Add any cross-contact or shared-facility warning only after confirming the actual packing facility's allergen handling practices.
          </p>

          <h2>Storage & Handling Instructions</h2>
          <p>
            Store in a cool, dry place away from direct sunlight and heat. After opening, store kernels in an airtight container or refrigerator to preserve freshness and crisp crunch.
          </p>
        </div>
      </section>

      <footer className="commerce-footer">
        <Link className="logo" href="/">
          KASHUR<span>MEWA</span>
        </Link>
        <Link href="/about">About Brand</Link>
        <Link href="/policies/shipping">Shipping Policy</Link>
      </footer>
    </main>
  );
}

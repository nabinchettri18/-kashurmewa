"use client";

import { useState } from "react";

const product = { name: "Kashmiri Walnuts", price: 799, size: "500g" };

export default function Home() {
  const [cart, setCart] = useState(0);
  const [size, setSize] = useState("500g");

  return (
    <main>
      <div className="announcement">FREE PAN-INDIA DELIVERY ON ORDERS ABOVE ₹999</div>
      <header className="header">
        <a className="brand" href="#">KASHUR<span>MEWA</span></a>
        <nav><a href="#shop">Shop</a><a href="#story">Our Story</a><a href="#origin">Kashmir</a><a href="#journal">Journal</a></nav>
        <div className="actions"><button aria-label="Search">⌕</button><button aria-label="Account">♙</button><button className="cart" onClick={()=>setCart(cart+1)}>Bag <b>{cart}</b></button></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THE TASTE OF KASHMIR</p>
          <h1>Walnuts from the<br/><em>valleys of Kashmir.</em></h1>
          <p className="lead">A thoughtfully sourced selection of Kashmiri walnuts, packed to preserve their natural character and delivered to your door.</p>
          <div className="hero-cta"><a className="button dark" href="#shop">SHOP WALNUTS <span>↗</span></a><span className="quiet">Naturally grown · Carefully packed</span></div>
        </div>
        <div className="hero-art">
          <div className="sun"></div><div className="mountain m1"></div><div className="mountain m2"></div>
          <div className="walnut walnut-a">◉</div><div className="walnut walnut-b">◉</div>
          <div className="label">KASHMIRI<br/><strong>WALNUTS</strong><small>500 G · PREMIUM SELECTION</small></div>
        </div>
      </section>

      <section className="strip"><span>ORIGIN</span><strong>KASHMIR, INDIA</strong><span>SELECTION</span><strong>PREMIUM WALNUTS</strong><span>DELIVERY</span><strong>PAN-INDIA</strong></section>

      <section id="shop" className="product-section">
        <div className="section-head"><div><p className="eyebrow">FROM THE VALLEY</p><h2>A walnut worth<br/><em>opening slowly.</em></h2></div><p>Simple ingredients. Honest sourcing. No unnecessary noise.</p></div>
        <div className="product-grid">
          <div className="product-image"><div className="pack">KASHUR<br/><span>MEWA</span><small>KASHMIRI WALNUTS</small></div><div className="nuts">◉ ◉ ◉</div></div>
          <div className="product-info">
            <p className="eyebrow">01 / SIGNATURE</p><h3>Kashmiri Walnuts</h3><p className="description">Premium walnuts selected for their clean taste, delicate texture and unmistakable Kashmiri character.</p>
            <div className="details"><div><span>Origin</span><b>Kashmir, India</b></div><div><span>Ingredients</span><b>100% Walnuts</b></div><div><span>Pack</span><b>Resealable</b></div></div>
            <div className="size-row"><span>SELECT SIZE</span><div>{["250g","500g","1kg"].map(s=><button key={s} className={size===s?"selected":""} onClick={()=>setSize(s)}>{s}</button>)}</div></div>
            <div className="buy"><strong>₹{size==="250g"?449:size==="500g"?799:1399}</strong><button className="button dark" onClick={()=>setCart(cart+1)}>ADD TO BAG <span>+</span></button></div>
          </div>
        </div>
      </section>

      <section id="story" className="story">
        <div><p className="eyebrow">THE KASHURMEWA STORY</p><h2>From Kashmir,<br/><em>with care.</em></h2></div>
        <div className="story-copy"><p>Kashurmewa is built around a simple idea: good food does not need to be complicated. We bring the character of Kashmir to the everyday table through carefully selected produce and considered packaging.</p><p>Every pack is prepared with attention to freshness, origin and the small details that make a pantry staple feel special.</p><a href="#origin">DISCOVER OUR APPROACH →</a></div>
      </section>

      <section id="origin" className="origin">
        <div className="origin-image"><div className="ridge"></div><span>THE VALLEY</span></div>
        <div className="origin-copy"><p className="eyebrow">WHERE IT BEGINS</p><h2>The character of<br/><em>Kashmir.</em></h2><p>High valleys, cool seasons and generations of cultivation give Kashmiri walnuts their distinctive place in the pantry.</p><div className="origin-facts"><span><b>01</b> SOURCE WITH CARE</span><span><b>02</b> PACK FOR FRESHNESS</span><span><b>03</b> DELIVER WITH PURPOSE</span></div></div>
      </section>

      <section id="journal" className="journal"><div className="section-head"><div><p className="eyebrow">FROM THE JOURNAL</p><h2>Notes from<br/><em>the valley.</em></h2></div></div><div className="journal-grid"><article><span>01 · ORIGIN</span><h3>What makes a Kashmiri walnut different?</h3><a href="#">READ NOTE →</a></article><article><span>02 · PANTRY</span><h3>A simple guide to storing walnuts well.</h3><a href="#">READ NOTE →</a></article><article><span>03 · KASHMIR</span><h3>Following the walnut season through the valley.</h3><a href="#">READ NOTE →</a></article></div></section>

      <footer><div className="footer-brand"><a className="brand" href="#">KASHUR<span>MEWA</span></a><p>The Taste of Kashmir.</p></div><div><span className="footer-title">SHOP</span><a href="#shop">Kashmiri Walnuts</a><a href="#">Shipping & Delivery</a><a href="#">Contact</a></div><div><span className="footer-title">FOLLOW</span><a href="#">Instagram</a><a href="#">Facebook</a><a href="#">YouTube</a></div><div><span className="footer-title">NEWSLETTER</span><p>Occasional notes from Kashmir.</p><div className="email"><input placeholder="Your email address"/><button>→</button></div></div><div className="copyright">© 2026 KASHURMEWA · ALL RIGHTS RESERVED</div></footer>
    </main>
  );
}

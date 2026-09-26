"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Variant = { id:string; size:string; price_inr:number; stock:number };
type Product = {
  id:string; name:string; description:string; origin:string; ingredients:string;
  variants:Variant[];
  images:{url:string; alt_text:string|null; sort_order:number}[];
};

const FALLBACKS = [
  "https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg",
  "https://images.pexels.com/photos/14627184/pexels-photo-14627184.jpeg",
  "https://images.pexels.com/photos/16089996/pexels-photo-16089996.jpeg",
];

export default function Home(){
  const [product,setProduct]=useState<Product|null>(null);
  const [size,setSize]=useState("");
  const [cart,setCart]=useState(0);
  const [error,setError]=useState("");

  useEffect(()=>{
    (async()=>{
      const {data,error}=await supabase
        .from("km_products")
        .select("id,name,description,origin,ingredients,km_product_variants(id,size,price_inr,stock),km_product_images(url,alt_text,sort_order)")
        .eq("slug","kashmiri-walnuts").eq("active",true).single();

      if(error){setError("Product catalogue is temporarily unavailable.");return;}
      const p=data as any;
      p.variants=(p.km_product_variants||[]).sort((a:Variant,b:Variant)=>a.price_inr-b.price_inr);
      p.images=(p.km_product_images||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order);
      setProduct(p);
      setSize(p.variants[0]?.size||"");

      try{
        const c=JSON.parse(localStorage.getItem("kashurmewa-cart")||"[]");
        setCart(c.reduce((n:number,i:{qty:number})=>n+i.qty,0));
      }catch{}
    })();
  },[]);

  const selected=product?.variants.find(v=>v.size===size);
  const image=(index:number)=>product?.images[index]?.url||FALLBACKS[index];

  const addToBag=()=>{
    if(!selected||!product)return;
    try{
      const current=JSON.parse(localStorage.getItem("kashurmewa-cart")||"[]");
      const existing=current.find((i:{variantId?:string})=>i.variantId===selected.id);
      if(existing) existing.qty+=1;
      else current.push({productId:product.id,variantId:selected.id,qty:1});
      localStorage.setItem("kashurmewa-cart",JSON.stringify(current));
      setCart(current.reduce((n:number,i:{qty:number})=>n+i.qty,0));
    }catch{}
  };

  return <main>
    <div className="announcement"><span>THE TASTE OF KASHMIR</span><strong>COMPLIMENTARY PAN-INDIA DELIVERY ABOVE ₹999</strong><span>EST. 2026</span></div>

    <header className="header">
      <button className="mobile-menu" aria-label="Menu">☰</button>
      <Link className="brand" href="/">KASHUR<span>MEWA</span></Link>
      <nav><a href="#shop">Shop</a><a href="#story">Our Story</a><a href="#origin">Kashmir</a><a href="#journal">Journal</a></nav>
      <div className="actions">
        <button aria-label="Search">⌕</button>
        <Link aria-label="Account" href="/login">◯</Link>
        <Link className="cart" href="/cart">Bag <b>{cart.toString().padStart(2,"0")}</b></Link>
      </div>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <div>
          <p className="eyebrow">01 — FROM THE VALLEYS OF KASHMIR</p>
          <h1>A quieter kind<br/>of <em>goodness.</em></h1>
          <p className="lead">Kashmiri walnuts selected for their delicate character, packed with care and brought to the modern Indian table.</p>
          <div className="hero-cta">
            <a className="button dark" href="#shop">SHOP WALNUTS <span>↗</span></a>
            <a className="text-link" href="#story">OUR STORY <span>→</span></a>
          </div>
        </div>
        <div className="hero-bottom"><span>100% WALNUTS</span><span>ORIGIN · KASHMIR, INDIA</span><span>SMALL-BATCH PACKING</span></div>
      </div>
      <div className="hero-photo">
        <Image src={image(0)} alt="Kashmir valley" fill priority sizes="(max-width: 850px) 100vw, 58vw"/>
        <div className="hero-overlay"></div>
        <div className="hero-label"><span>01</span><strong>THE VALLEY</strong><small>Kashmir, India</small></div>
        <div className="hero-product-card">
          <div className="mini-image"><Image src={image(1)} alt="Kashmiri walnuts" fill sizes="120px"/></div>
          <div><span>THE SIGNATURE</span><strong>Kashmiri Walnuts</strong><small>From ₹{product?.variants[0]?.price_inr ? Number(product.variants[0].price_inr).toLocaleString("en-IN") : "449"}</small></div>
          <a href="#shop">+</a>
        </div>
      </div>
    </section>

    <section className="marquee"><span>KASHURMEWA</span><i>✦</i><span>THE TASTE OF KASHMIR</span><i>✦</i><span>CAREFULLY SOURCED</span><i>✦</i><span>THE TASTE OF KASHMIR</span><i>✦</i></section>

    <section id="shop" className="product-section">
      <div className="section-intro">
        <div><p className="eyebrow">02 — THE COLLECTION</p><h2>One product.<br/><em>Done properly.</em></h2></div>
        <p>Nothing crowded. Nothing unnecessary. Just a considered pack of Kashmiri walnuts, made easy to bring home.</p>
      </div>
      {error?<div className="catalog-error">{error}</div>:product?
        <div className="product-showcase">
          <div className="product-visual">
            <Image src={image(1)} alt={product.images[1]?.alt_text||product.name} fill sizes="(max-width:850px) 100vw, 56vw"/>
            <span className="vertical-label">KASHURMEWA / SIGNATURE WALNUTS</span>
            <div className="product-number">01</div>
          </div>
          <div className="product-info">
            <div className="product-kicker"><span>THE SIGNATURE</span><span>IN STOCK</span></div>
            <h3>{product.name}</h3>
            <p className="description">{product.description}</p>
            <div className="details">
              <div><span>Origin</span><b>{product.origin}</b></div>
              <div><span>Ingredients</span><b>{product.ingredients}</b></div>
              <div><span>Format</span><b>Resealable pack</b></div>
              <div><span>Dispatch</span><b>Pan-India</b></div>
            </div>
            <div className="size-row"><span>SELECT YOUR SIZE</span><div>{product.variants.map(v=><button key={v.id} disabled={v.stock===0} className={size===v.size?"selected":""} onClick={()=>setSize(v.size)}>{v.size}</button>)}</div></div>
            <div className="buy"><div><small>YOUR SELECTION</small><strong>{selected?"₹"+Number(selected.price_inr).toLocaleString("en-IN"):"—"}</strong></div><button className="button dark" disabled={!selected||selected.stock===0} onClick={addToBag}>{selected?.stock===0?"OUT OF STOCK":"ADD TO BAG"} <span>+</span></button></div>
            <p className="shipping-note">Free delivery on orders above ₹999 · Secure checkout</p>
          </div>
        </div>:<div className="catalog-loading">Loading the harvest...</div>}
    </section>

    <section className="feature-rail">
      <div><span>01</span><strong>ORIGIN FIRST</strong><p>We keep the story of where the food comes from at the centre.</p></div>
      <div><span>02</span><strong>CAREFULLY PACKED</strong><p>Thoughtful packaging designed to protect freshness.</p></div>
      <div><span>03</span><strong>MADE FOR EVERYDAY</strong><p>A pantry staple that belongs at breakfast, dessert or simply by itself.</p></div>
    </section>

    <section id="story" className="story">
      <div className="story-image"><Image src={image(2)} alt="Walnuts" fill sizes="(max-width:850px) 100vw, 50vw"/><div>THE DETAILS MATTER</div></div>
      <div className="story-copy"><p className="eyebrow">03 — THE KASHURMEWA STORY</p><h2>From Kashmir,<br/><em>with care.</em></h2><p>Kashurmewa is built around a simple idea: good food does not need to be complicated. We bring the character of Kashmir to the everyday table through carefully selected produce and considered packaging.</p><p>Every pack is prepared with attention to freshness, origin and the small details that make a pantry staple feel special.</p><a className="text-link light" href="#origin">DISCOVER OUR APPROACH <span>→</span></a></div>
    </section>

    <section id="origin" className="origin">
      <div className="origin-image"><Image src={FALLBACKS[0]} alt="Kashmir mountains and valley" fill sizes="(max-width:850px) 100vw, 55vw"/><div className="origin-stamp">KASHURMEWA<br/><b>KASHMIR · INDIA</b></div></div>
      <div className="origin-copy"><p className="eyebrow">04 — WHERE IT BEGINS</p><h2>The character<br/>of <em>Kashmir.</em></h2><p>High valleys, cool seasons and generations of cultivation give Kashmiri walnuts their distinctive place in the pantry.</p><div className="origin-facts"><span><b>01</b><strong>SOURCE WITH CARE</strong></span><span><b>02</b><strong>PACK FOR FRESHNESS</strong></span><span><b>03</b><strong>DELIVER WITH PURPOSE</strong></span></div></div>
    </section>

    <section id="journal" className="journal">
      <div className="section-intro"><div><p className="eyebrow">05 — THE JOURNAL</p><h2>Notes from<br/><em>the valley.</em></h2></div><a className="text-link" href="#">VIEW ALL <span>→</span></a></div>
      <div className="journal-grid">
        <article><div className="journal-image j1"></div><span>01 · ORIGIN</span><h3>What makes a Kashmiri walnut different?</h3><a href="#">READ NOTE →</a></article>
        <article><div className="journal-image j2"></div><span>02 · PANTRY</span><h3>A simple guide to storing walnuts well.</h3><a href="#">READ NOTE →</a></article>
        <article><div className="journal-image j3"></div><span>03 · KASHMIR</span><h3>Following the walnut season through the valley.</h3><a href="#">READ NOTE →</a></article>
      </div>
    </section>

    <section className="newsletter"><p className="eyebrow">FROM KASHURMEWA</p><h2>A little taste of<br/><em>the valley.</em></h2><p>Occasional notes, new harvests and things worth bringing home.</p><div className="newsletter-form"><input placeholder="Your email address"/><button>JOIN →</button></div></section>

    <footer>
      <div className="footer-top"><div className="footer-brand"><Link className="brand" href="/">KASHUR<span>MEWA</span></Link><p>The Taste of Kashmir.</p></div><div><span className="footer-title">SHOP</span><a href="#shop">Kashmiri Walnuts</a><Link href="/cart">Cart & Checkout</Link><a href="#">Contact</a></div><div><span className="footer-title">EXPLORE</span><a href="#story">Our Story</a><a href="#origin">Kashmir</a><a href="#journal">Journal</a></div><div><span className="footer-title">LEGAL</span><a href="/privacy-policy">Privacy</a><a href="/terms">Terms</a><a href="/shipping-policy">Shipping</a></div></div>
      <div className="copyright"><span>© 2026 KASHURMEWA</span><span>THE TASTE OF KASHMIR</span><span>MADE WITH CARE IN INDIA</span></div>
    </footer>
  </main>;
}

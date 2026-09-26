"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Variant={id:string;size:string;price_inr:number;stock:number};
type Product={id:string;name:string;description:string;origin:string;ingredients:string;variants:Variant[];images:{url:string;alt_text:string|null;sort_order:number}[]};

const fallbackImages=[
  "https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg",
  "https://images.pexels.com/photos/14627184/pexels-photo-14627184.jpeg",
  "https://images.pexels.com/photos/16089996/pexels-photo-16089996.jpeg",
];

export default function Home(){
  const [product,setProduct]=useState<Product|null>(null);
  const [size,setSize]=useState("");
  const [cart,setCart]=useState(0);
  const [error,setError]=useState("");

  useEffect(()=>{(async()=>{
    const {data,error}=await supabase.from("km_products")
      .select("id,name,description,origin,ingredients,km_product_variants(id,size,price_inr,stock),km_product_images(url,alt_text,sort_order)")
      .eq("slug","kashmiri-walnuts").eq("active",true).single();
    if(error){setError("Product catalogue is temporarily unavailable.");return;}
    const p=data as any;
    p.variants=(p.km_product_variants||[]).sort((a:Variant,b:Variant)=>a.price_inr-b.price_inr);
    p.images=(p.km_product_images||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order);
    setProduct(p); setSize(p.variants[0]?.size||"");
    try{const c=JSON.parse(localStorage.getItem("kashurmewa-cart")||"[]");setCart(c.reduce((n:number,i:{qty:number})=>n+i.qty,0));}catch{}
  })()},[]);

  const images=useMemo(()=>product?.images?.map(i=>i.url).filter(Boolean).length?product.images.map(i=>i.url):fallbackImages, [product]);
  const selected=product?.variants.find(v=>v.size===size);

  const addToBag=()=>{
    if(!selected||!product)return;
    try{
      const current=JSON.parse(localStorage.getItem("kashurmewa-cart")||"[]");
      const existing=current.find((i:{variantId:string})=>i.variantId===selected.id);
      if(existing) existing.qty+=1; else current.push({productId:product.id,variantId:selected.id,qty:1});
      localStorage.setItem("kashurmewa-cart",JSON.stringify(current));
      setCart(current.reduce((n:number,i:{qty:number})=>n+i.qty,0));
    }catch{}
  };

  return <main>
    <div className="topbar"><span>THE TASTE OF KASHMIR</span><span>COMPLIMENTARY DELIVERY ON ORDERS OVER ₹999</span><span>100% WALNUTS</span></div>

    <header className="site-header">
      <button className="mobile-menu" aria-label="Menu">☰</button>
      <Link className="logo" href="/">KASHUR<span>MEWA</span></Link>
      <nav className="main-nav">
        <a href="#shop">Shop</a><a href="#story">Our Story</a><a href="#origin">The Valley</a><a href="#journal">Journal</a>
      </nav>
      <div className="header-actions">
        <button aria-label="Search">⌕</button>
        <button aria-label="Account">♙</button>
        <Link href="/cart" className="bag">Bag <span>{cart}</span></Link>
      </div>
    </header>

    <section className="hero-new">
      <div className="hero-left">
        <div className="hero-kicker"><span>01</span> WALNUTS · KASHMIR, INDIA</div>
        <h1>A little piece<br/>of <i>Kashmir.</i></h1>
        <p>Premium Kashmiri walnuts selected for their clean taste, delicate texture and unmistakable character.</p>
        <div className="hero-actions">
          <a className="primary-btn" href="#shop">SHOP WALNUTS <b>↗</b></a>
          <a className="text-btn" href="#story">OUR STORY <span>→</span></a>
        </div>
        <div className="hero-meta"><span>ORIGIN <b>{product?.origin||"KASHMIR, INDIA"}</b></span><span>INGREDIENT <b>100% WALNUTS</b></span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-frame">
          <Image src={images[0]} alt="Kashurmewa walnuts and Kashmir landscape" fill priority sizes="(max-width: 800px) 100vw, 58vw"/>
        </div>
        <div className="hero-card">
          <span>THE SIGNATURE PACK</span>
          <strong>{product?.name||"Kashmiri Walnuts"}</strong>
          <small>From ₹{selected?Number(selected.price_inr).toLocaleString("en-IN"):"449"}</small>
          <a href="#shop">VIEW PRODUCT →</a>
        </div>
        <div className="round-mark">FROM<br/>KASHMIR<br/><b>✦</b><br/>INDIA</div>
      </div>
    </section>

    <div className="trust-row"><span>CAREFULLY SELECTED</span><span>PACKED FOR FRESHNESS</span><span>DELIVERED PAN-INDIA</span><span>100% WALNUTS</span></div>

    <section id="shop" className="shop-new">
      <div className="section-intro"><div><small>SHOP KASHURMEWA</small><h2>The everyday<br/><i>luxury.</i></h2></div><p>One ingredient. Nothing to hide. Choose your pack and bring the taste of the valley to your table.</p></div>
      {error?<div className="catalog-error">{error}</div>:product?<div className="shop-layout">
        <div className="large-product-card">
          <div className="product-photo"><Image src={images[1]||images[0]} alt="Kashmiri walnuts" fill sizes="(max-width: 800px) 100vw, 52vw"/><span className="photo-label">KASHMIRI WALNUTS · 01</span></div>
          <div className="large-product-info"><div><small>SIGNATURE COLLECTION</small><h3>{product.name}</h3><p>{product.description}</p></div><Link href="/cart" className="circle-arrow">↗</Link></div>
        </div>
        <div className="buy-panel">
          <small>SELECT YOUR PACK</small>
          <h3>Choose your<br/><i>ritual.</i></h3>
          <div className="variant-list">{product.variants.map(v=><button key={v.id} disabled={!v.stock} className={size===v.size?"active":""} onClick={()=>setSize(v.size)}><span>{v.size}</span><b>₹{Number(v.price_inr).toLocaleString("en-IN")}</b><em>{v.stock?"AVAILABLE":"SOLD OUT"}</em></button>)}</div>
          <div className="buy-bottom"><strong>₹{selected?Number(selected.price_inr).toLocaleString("en-IN"):"—"}</strong><button onClick={addToBag} disabled={!selected||!selected.stock} className="primary-btn">{selected?.stock?"ADD TO BAG":"OUT OF STOCK"} <b>+</b></button></div>
          <div className="micro-copy">Secure checkout · Freshly packed · Pan-India delivery</div>
        </div>
      </div>:<div className="catalog-loading">Loading the harvest...</div>}
    </section>

    <section className="benefits">
      <div className="benefit-lead"><small>WHY KASHURMEWA</small><h2>Good food.<br/><i>Beautifully simple.</i></h2></div>
      <div className="benefit"><span>01</span><b>ORIGIN FIRST</b><p>Sourced with attention to where the walnut comes from and how it reaches you.</p></div>
      <div className="benefit"><span>02</span><b>FRESHNESS</b><p>Packed thoughtfully to protect the taste and texture you expect.</p></div>
      <div className="benefit"><span>03</span><b>NOTHING EXTRA</b><p>Just walnuts. No unnecessary ingredients, noise or complicated promises.</p></div>
    </section>

    <section id="story" className="story-new">
      <div className="story-image"><Image src={images[2]||images[0]} alt="Whole Kashmiri walnuts" fill sizes="(max-width: 800px) 100vw, 48vw"/></div>
      <div className="story-text"><small>THE KASHURMEWA STORY</small><h2>From the valley<br/><i>to your table.</i></h2><p>Kashurmewa is built around a simple idea: the best pantry staples deserve care. We bring the character of Kashmir to the everyday table through carefully selected walnuts and considered presentation.</p><p>Less processing. Less noise. More attention to the ingredient itself.</p><a href="#origin">DISCOVER THE STORY <span>→</span></a></div>
    </section>

    <section id="origin" className="valley">
      <div className="valley-copy"><small>THE VALLEY</small><h2>Where the<br/><i>story begins.</i></h2><p>There is a particular character to produce shaped by place. Kashmir is not simply where our walnuts come from — it is part of what makes the experience distinctive.</p><div className="valley-list"><span><b>01</b> SOURCE WITH CARE</span><span><b>02</b> PACK FOR FRESHNESS</span><span><b>03</b> DELIVER WITH PURPOSE</span></div></div>
      <div className="valley-image"><Image src={images[0]} alt="Kashmir valley" fill sizes="(max-width: 800px) 100vw, 55vw"/><div>THE VALLEYS<br/><i>OF KASHMIR</i></div></div>
    </section>

    <section className="ritual"><div><small>THE WALNUT RITUAL</small><h2>More than<br/><i>a snack.</i></h2></div><div className="ritual-grid"><article><span>01</span><b>Morning</b><p>Fold into breakfast bowls, oats or yoghurt.</p></article><article><span>02</span><b>Afternoon</b><p>Keep a handful nearby for a simple everyday bite.</p></article><article><span>03</span><b>Evening</b><p>Add texture to salads, desserts and home baking.</p></article></div></section>

    <section id="journal" className="journal-new"><div className="section-intro"><div><small>FROM THE JOURNAL</small><h2>Notes from<br/><i>the valley.</i></h2></div><a href="#">VIEW ALL →</a></div><div className="journal-cards"><article><div className="journal-number">01</div><small>ORIGIN</small><h3>What makes a Kashmiri walnut different?</h3><a href="#">READ NOTE →</a></article><article><div className="journal-number">02</div><small>PANTRY</small><h3>A simple guide to storing walnuts well.</h3><a href="#">READ NOTE →</a></article><article><div className="journal-number">03</div><small>KASHMIR</small><h3>Following the walnut season through the valley.</h3><a href="#">READ NOTE →</a></article></div></section>

    <section className="newsletter"><div><small>STAY CLOSE</small><h2>Notes, harvests<br/><i>& new arrivals.</i></h2></div><div><p>Occasional letters from KASHURMEWA. No noise.</p><div className="newsletter-input"><input placeholder="Your email address"/><button>JOIN →</button></div></div></section>

    <footer className="footer-new"><div className="footer-main"><div><Link className="logo" href="/">KASHUR<span>MEWA</span></Link><p>The Taste of Kashmir.</p></div><div><small>SHOP</small><Link href="#shop">Kashmiri Walnuts</Link><Link href="/cart">Cart & Checkout</Link></div><div><small>EXPLORE</small><Link href="#story">Our Story</Link><Link href="#origin">The Valley</Link><Link href="#journal">Journal</Link></div><div><small>HELP</small><Link href="#">Contact</Link><Link href="#">Shipping</Link><Link href="#">Privacy</Link></div></div><div className="footer-bottom"><span>© 2026 KASHURMEWA</span><span>THE TASTE OF KASHMIR</span><span>MADE IN INDIA</span></div></footer>
  </main>;
}

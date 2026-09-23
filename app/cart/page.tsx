"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Item={size:string;qty:number;price:number};
const prices:Record<string,number>={ "250g":449,"500g":799,"1kg":1399 };

export default function CartPage(){
  const [items,setItems]=useState<Item[]>([]);
  useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem("kashurmewa-cart")||"[]"))}catch{}},[]);
  const update=(size:string,delta:number)=>{const next=items.map(i=>i.size===size?{...i,qty:Math.max(0,i.qty+delta)}).filter(i=>i.qty>0);setItems(next);localStorage.setItem("kashurmewa-cart",JSON.stringify(next));};
  const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0);
  return <main className="cart-page"><header className="simple-header"><Link className="brand" href="/">KASHUR<span>MEWA</span></Link><Link href="/">Continue shopping</Link></header>
    <section className="cart-wrap"><p className="eyebrow">YOUR BAG</p><h1>Ready for <em>the good stuff.</em></h1>
    {items.length===0?<div className="empty"><p>Your bag is empty.</p><Link className="button dark" href="/#shop">SHOP WALNUTS ↗</Link></div>:
    <div className="cart-layout"><div className="cart-items">{items.map(i=><div className="cart-item" key={i.size}><div><span>KASHURMEWA</span><h2>Kashmiri Walnuts</h2><p>{i.size}</p></div><div className="qty"><button onClick={()=>update(i.size,-1)}>−</button><b>{i.qty}</b><button onClick={()=>update(i.size,1)}>+</button></div><strong>₹{(i.price*i.qty).toLocaleString("en-IN")}</strong></div>)}</div>
    <aside className="summary"><span>ORDER SUMMARY</span><div><p>Subtotal</p><b>₹{subtotal.toLocaleString("en-IN")}</b></div><div><p>Delivery</p><b>{subtotal>=999?"FREE":"Calculated at checkout"}</b></div><hr/><div><p>Total</p><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div><button className="button dark checkout">PROCEED TO CHECKOUT ↗</button><small>Secure checkout · Pan-India delivery</small></aside></div>}</section></main>
}
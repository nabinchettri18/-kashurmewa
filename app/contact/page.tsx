"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { KashurmewLogo } from "@/components/brand/Logo";
import { NavigationHeader } from "@/components/navigation/Header";
import "../kashurmewa-storefront.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not send your message.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="km-store ks-v2-contact-page">
      <div className="ks-announcement"><span>THE TASTE OF KASHMIR</span><span>Thoughtfully chosen. Beautifully brought home. <ArrowRight size={12} /></span></div>
      <NavigationHeader />
      <section className="ks-v2-contact-layout">
        <div className="ks-v2-contact-intro">
          <span className="ks-v2-eyebrow ks-v2-eyebrow-dark">CUSTOMER CARE</span>
          <h1>Here to help.<br /><em>Happy to hear from you.</em></h1>
          <p>Questions about an order, product details or a future collaboration? Send us a message and our team will get back to you.</p>
          <div className="ks-v2-contact-note"><span>01</span><div><strong>Order support</strong><small>Include your order reference if you already placed an order.</small></div></div>
          <div className="ks-v2-contact-note"><span>02</span><div><strong>Product questions</strong><small>Ask us about pack sizes, ingredients or product information before ordering.</small></div></div>
          <img src="https://images.pexels.com/photos/37309469/pexels-photo-37309469.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Natural walnut texture" loading="lazy" />
        </div>
        <div className="ks-v2-contact-form-wrap">
          <span className="ks-v2-eyebrow ks-v2-eyebrow-dark">WRITE TO US</span>
          <h2>{submitted ? "Message received." : "Send a message."}</h2>
          {submitted ? (
            <div className="ks-v2-contact-success" role="status"><span>THANK YOU, {name.toUpperCase()}</span><p>Your message has been sent to our support inbox. We will reply to <strong>{email}</strong> when our team reviews it.</p><Link className="ks-v2-text-link" href="/shop">Return to the collection <ArrowRight size={15} /></Link></div>
          ) : (
            <form className="ks-v2-contact-form" onSubmit={handleSubmit}>
              <div className="ks-v2-contact-fields">
                <div><label htmlFor="ct-name">Full name *</label><input id="ct-name" type="text" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></div>
                <div><label htmlFor="ct-email">Email address *</label><input id="ct-email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
              </div>
              <div><label htmlFor="ct-subject">Subject / order reference</label><input id="ct-subject" type="text" maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Order enquiry / product question" /></div>
              <div><label htmlFor="ct-message">Your message *</label><textarea id="ct-message" required maxLength={5000} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us how we can help." /></div>
              {error && <p className="ks-v2-contact-error" role="alert">{error}</p>}
              <button type="submit" disabled={busy}>{busy ? "SENDING MESSAGE…" : <>Send your message <ArrowUpRight size={16} /></>}</button>
              <small>We’ll use these details only to respond to your enquiry.</small>
            </form>
          )}
        </div>
      </section>
      <footer className="ks-v2-footer"><div className="ks-v2-footer-main"><div className="ks-v2-footer-brand"><KashurmewLogo variant="light" size="lg" /><p>A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.</p><Link href="/contact">Questions? Get in touch <ArrowUpRight size={14} /></Link></div><div><small>SHOP</small><Link href="/shop">Shop the collection</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div><div><small>THE BRAND</small><Link href="/about">Our story</Link><Link href="/">Home</Link><Link href="/contact">Contact us</Link></div><div><small>HELP & POLICIES</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns & refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div></div><div className="ks-v2-footer-bottom"><span>© Kashurmewa</span><span>THE TASTE OF KASHMIR.</span><Link href="/policies/food-safety">Food safety information</Link></div></footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { KashurmewLogo } from "@/components/brand/Logo";

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
    <main className="commerce-page">
      <header className="commerce-header">
        <KashurmewLogo variant="dark" size="sm" />
        <nav>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About Us</Link>
          <Link className="active" href="/contact">Contact</Link>
        </nav>
        <Link className="commerce-bag" href="/cart">Bag ↗</Link>
      </header>
      <section className="policy-page">
        <div className="policy-header">
          <span className="commerce-eyebrow">CUSTOMER SUPPORT</span>
          <h1>We are here<br /><i>to help.</i></h1>
          <p className="detail-description">Have questions about an order, wholesale inquiry, or pack details? Reach out to our team.</p>
        </div>
        {submitted ? (
          <div className="order-success-card" style={{ background: "#F7F3EB", border: "1px solid #E7DED1", padding: "40px" }}>
            <span className="badge">MESSAGE RECEIVED</span>
            <h2>Thank you, {name}!</h2>
            <p>Your message has been saved to our support inbox. We will reply to <strong>{email}</strong> when our team reviews it.</p>
            <Link href="/shop" className="primary-btn" style={{ display: "inline-block", marginTop: "20px" }}>RETURN TO SHOP ↗</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#FFFDF8", border: "1px solid #E7DED1", padding: "36px" }}>
            <div className="checkout-grid">
              <div className="checkout-field">
                <label htmlFor="ct-name">Full Name *</label>
                <input id="ct-name" type="text" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="checkout-field">
                <label htmlFor="ct-email">Email Address *</label>
                <input id="ct-email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <div className="checkout-grid full">
              <div className="checkout-field">
                <label htmlFor="ct-subject">Subject / Order Ref (Optional)</label>
                <input id="ct-subject" type="text" maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Order Inquiry / Product Question" />
              </div>
            </div>
            <div className="checkout-grid full">
              <div className="checkout-field">
                <label htmlFor="ct-message">Message *</label>
                <textarea id="ct-message" required maxLength={5000} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we assist you today?" style={{ padding: "12px", border: "1px solid #E7DED1", background: "#F7F3EB", fontFamily: "inherit", fontSize: "13px" }} />
              </div>
            </div>
            {error && <p role="alert" style={{ color: "#9B2C2C" }}>{error}</p>}
            <button type="submit" disabled={busy} className="primary-btn" style={{ marginTop: "20px", width: "100%" }}>
              {busy ? "SENDING…" : "SEND MESSAGE ↗"}
            </button>
          </form>
        )}
      </section>
      <footer className="commerce-footer">
        <KashurmewLogo variant="dark" size="sm" />
        <Link href="/shop">Shop Walnuts</Link>
        <Link href="/policies/shipping">Shipping Policy</Link>
      </footer>
    </main>
  );
}

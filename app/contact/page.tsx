"use client";

import Link from "next/link";
import { useState } from "react";
import { KashurmewLogo } from "@/components/brand/Logo";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        <Link className="commerce-bag" href="/cart">
          Bag ↗
        </Link>
      </header>

      <section className="policy-page">
        <div className="policy-header">
          <span className="commerce-eyebrow">CUSTOMER SUPPORT</span>
          <h1>
            We are here<br />
            <i>to help.</i>
          </h1>
          <p className="detail-description">
            Have questions about an order, wholesale inquiry, or pack details? Reach out to our team.
          </p>
        </div>

        {submitted ? (
          <div className="order-success-card" style={{ background: "#F7F3EB", border: "1px solid #E7DED1", padding: "40px" }}>
            <span className="badge">MESSAGE RECEIVED</span>
            <h2>Thank you, {name}!</h2>
            <p>Our customer support team will respond to your query at <strong>{email}</strong> within 24 business hours.</p>
            <Link href="/shop" className="primary-btn" style={{ display: "inline-block", marginTop: "20px" }}>
              RETURN TO SHOP ↗
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#FFFDF8", border: "1px solid #E7DED1", padding: "36px" }}>
            <div className="checkout-grid">
              <div className="checkout-field">
                <label htmlFor="ct-name">Full Name *</label>
                <input
                  id="ct-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="ct-email">Email Address *</label>
                <input
                  id="ct-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="checkout-grid full">
              <div className="checkout-field">
                <label htmlFor="ct-subject">Subject / Order Ref (Optional)</label>
                <input
                  id="ct-subject"
                  type="text"
                  placeholder="Order Inquiry / Product Question"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="checkout-grid full">
              <div className="checkout-field">
                <label htmlFor="ct-message">Message *</label>
                <textarea
                  id="ct-message"
                  required
                  rows={5}
                  placeholder="How can we assist you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    padding: "12px",
                    border: "1px solid #E7DED1",
                    background: "#F7F3EB",
                    fontFamily: "inherit",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" style={{ marginTop: "20px", width: "100%" }}>
              SEND MESSAGE ↗
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

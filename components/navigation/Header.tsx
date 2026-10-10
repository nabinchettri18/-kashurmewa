"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Menu, X, ArrowRight } from "lucide-react";
import { KashurmewLogo } from "@/components/brand/Logo";

export function NavigationHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        <span>KASHURMEWA — HARVEST 2026</span>
        <span>100% NATURAL KASHMIRI WALNUTS IN SHELL</span>
        <span>FREE PAN-INDIA DELIVERY ABOVE ₹999</span>
      </div>

      <header
        className={`site-header transition-all duration-500 ${
          scrolled
            ? "shadow-md bg-[#10291f]/95 backdrop-blur-md border-b border-[#345043]/80 py-3"
            : "bg-[#10291f] border-b border-[#345043]/40 py-5"
        }`}
      >
        <button
          className="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <KashurmewLogo variant="light" size="sm" />

        <nav className="main-nav">
          <Link href="/shop" className="hover:text-[#B69A66] transition-colors">
            Shop Walnuts
          </Link>
          <a href="/#story" className="hover:text-[#B69A66] transition-colors">
            Our Story
          </a>
          <a href="/#origin" className="hover:text-[#B69A66] transition-colors">
            Kashmir Origin
          </a>
          <Link href="/about" className="hover:text-[#B69A66] transition-colors">
            About Brand
          </Link>
          <a href="/#faq" className="hover:text-[#B69A66] transition-colors">
            FAQ
          </a>
        </nav>

        <div className="header-actions">
          <Link href="/account" aria-label="Account" className="flex items-center gap-1.5 hover:text-[#B69A66]">
            <User size={16} />
            <span className="hidden sm:inline text-xs">Account</span>
          </Link>

          <Link href="/cart" className="bag">
            <ShoppingBag size={15} />
            <span>Bag</span>
            <span className="bg-[#B69A66] text-[#10291F] font-bold rounded-full w-5 h-5 flex items-center justify-center text-[10px] ml-1">
              {cartCount}
            </span>
          </Link>
        </div>
      </header>

      {/* Animated Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-x-0 top-[105px] bg-[#10291f] border-b border-[#345043] p-6 shadow-2xl z-50 md:hidden"
          >
            <div className="flex flex-col gap-5 text-sm uppercase tracking-widest text-[#f5f0e5]">
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pb-3 border-b border-[#345043]">
                <span>Shop Catalogue</span>
                <ArrowRight size={16} className="text-[#B69A66]" />
              </Link>
              <a href="/#story" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pb-3 border-b border-[#345043]">
                <span>Our Story</span>
                <ArrowRight size={16} className="text-[#B69A66]" />
              </a>
              <a href="/#origin" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pb-3 border-b border-[#345043]">
                <span>The Kashmir Valley</span>
                <ArrowRight size={16} className="text-[#B69A66]" />
              </a>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pb-3 border-b border-[#345043]">
                <span>About Brand</span>
                <ArrowRight size={16} className="text-[#B69A66]" />
              </Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pt-2 text-[#B69A66] font-semibold">
                <span>Your Bag ({cartCount})</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

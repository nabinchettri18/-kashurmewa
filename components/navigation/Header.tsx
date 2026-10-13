"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KashurmewLogo } from "@/components/brand/Logo";

export function NavigationHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveCartCount, setLiveCartCount] = useState(cartCount);

  useEffect(() => {
    const syncCartCount = () => {
      try {
        const saved = JSON.parse(window.localStorage.getItem("kashurmewa-cart") || "[]");
        setLiveCartCount(saved.reduce((total: number, item: { qty?: number }) => total + Math.max(0, Number(item.qty || 0)), 0));
      } catch {
        setLiveCartCount(0);
      }
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("kashurmewa-cart-updated", syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("kashurmewa-cart-updated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    setLiveCartCount(cartCount);
  }, [cartCount]);

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
        <span>THE TASTE OF KASHMIR</span>
        <span>A SENSE OF PLACE · A PLACE AT YOUR TABLE</span>
      </div>

      <header
        className={`site-header transition-all duration-500 ${
          scrolled
            ? "bg-[#FFFCF7] border-b border-[#E6D9C8] py-3"
            : "bg-[#FFFCF7] border-b border-[#E6D9C8] py-5"
        }`}
      >
        <button
          className="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <KashurmewLogo variant="dark" size="sm" />

        <nav className="main-nav">
          <Link href="/shop" className="hover:text-[#754D36] transition-colors">
            Collections
          </Link>
          <Link href="/about" className="hover:text-[#754D36] transition-colors">
            Our Story
          </Link>
          <Link href="/contact" className="hover:text-[#754D36] transition-colors">
            Contact
          </Link>
        </nav>

        <div className="header-actions">
          <Link href="/account" aria-label="Account" className="flex items-center gap-1.5 hover:text-[#754D36]">
            <span className="text-xs">Account</span>
          </Link>

          <Link href="/cart" className="bag">
            <span className="bg-[#4A2028] text-[#F6F0E6] font-bold rounded-full w-5 h-5 flex items-center justify-center text-[10px] ml-1">
              {liveCartCount}
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
            className="km-mobile-menu fixed inset-x-0 top-[100px] bg-[#4A2028] border-b border-[#63313B] p-6 z-50 md:hidden"
          >
            <div className="flex flex-col gap-5 text-sm uppercase tracking-widest text-[#F6F0E6]">
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pb-3 border-b border-[#E6D9C8]">
                <span>Shop Catalogue</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pb-3 border-b border-[#E6D9C8]">
                <span>Our Story</span>
                <ArrowRight size={16} className="text-[#C8A66A]" />
              </Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pb-3 border-b border-[#E6D9C8]">
                <span>Contact us</span>
                <ArrowRight size={16} className="text-[#C8A66A]" />
              </Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-between pt-2 text-[#C8A66A] font-semibold">
                <span>Your Bag ({liveCartCount})</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import {
  FadeInUp,
  FadeIn,
  ImageMaskReveal,
  TextWordReveal,
  ParallaxImage,
} from "@/components/motion/AnimationWrappers";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Truck, Sparkles, Leaf, ArrowUpRight, ChevronDown, CheckCircle } from "lucide-react";
import { KashurmewLogo } from "@/components/brand/Logo";

const HERO_IMAGES = [
  "https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg",
  "https://images.pexels.com/photos/14627184/pexels-photo-14627184.jpeg",
  "https://images.pexels.com/photos/16089996/pexels-photo-16089996.jpeg",
];

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("500 g");
  const [cartCount, setCartCount] = useState(0);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchProductBySlug("kashmiri-walnuts");
        if (p) {
          setProduct(p);
          if (p.variants.length) {
            setSize(p.variants[0].size);
          }
        }
      } catch (error) {
        console.error("Unable to load Kashurmewa featured product from Supabase.", error);
        setProductError(true);
      } finally {
        setProductLoading(false);
      }
      try {
        const c = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
        setCartCount(c.reduce((n: number, i: { qty: number }) => n + i.qty, 0));
      } catch {}
    })();
  }, []);

  const images = useMemo(
    () => (product?.images?.map((i) => i.url).filter(Boolean).length ? product.images.map((i) => i.url) : HERO_IMAGES),
    [product]
  );

  const selectedVariant: ProductVariant | undefined =
    product?.variants.find((v) => v.size === size) || product?.variants[0];

  const addToBag = () => {
    if (!selectedVariant || !product || selectedVariant.stock <= 0) return;
    try {
      const current = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const existing = current.find((i: { variantId: string }) => i.variantId === selectedVariant.id);
      const alreadyInCart = Number(existing?.qty || 0);
      if (alreadyInCart >= selectedVariant.stock) {
        setNotice("Your bag already contains the available quantity for this pack.");
        return;
      }
      if (existing) {
        existing.qty = Math.min(alreadyInCart + 1, selectedVariant.stock);
      } else {
        current.push({ productId: product.id, variantId: selectedVariant.id, qty: 1 });
      }
      localStorage.setItem("kashurmewa-cart", JSON.stringify(current));
      const count = current.reduce((n: number, i: { qty: number }) => n + i.qty, 0);
      setCartCount(count);
      setNotice(`Added ${selectedVariant.size} pack to your bag!`);
      setTimeout(() => setNotice(""), 3500);
    } catch {}
  };

  return (
    <main className="bg-[#FAF8F2] text-[#202722] selection:bg-[#B69A66] selection:text-[#10291F]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Brand",
            name: "Kashurmewa",
            description: "Premium Kashmiri walnuts in shell, sourced directly from high-altitude orchards in Kashmir.",
            url: "https://kashurmewa.com",
          }),
        }}
      />

      <NavigationHeader cartCount={cartCount} />

      {/* SECTION A — CINEMATIC FULL-VIEWPORT HERO */}
      <section className="relative min-h-[calc(100vh-105px)] bg-[#10291F] text-[#F5F0E5] grid grid-cols-1 lg:grid-cols-12 overflow-hidden items-center">
        <div className="lg:col-span-6 px-6 sm:px-12 lg:px-16 py-16 lg:py-24 z-10 flex flex-col justify-center">
          <FadeInUp delay={0.1}>
            <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#B69A66] uppercase font-semibold mb-6">
              <span className="w-8 h-[1px] bg-[#B69A66]"></span>
              01 · KASHMIR MOUNTAIN HARVEST
            </div>
          </FadeInUp>

          <FadeInUp delay={0.25}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal font-serif tracking-tight leading-[0.9] mb-8 text-[#F5F0E5]">
              Nature, at its <br />
              <i className="italic text-[#B69A66] font-serif">finest.</i>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <p className="text-sm sm:text-base text-[#C0C9C0] max-w-lg leading-relaxed font-light mb-10">
              Whole walnuts from Kashmir, thoughtfully selected and simply presented. A natural staple for everyday tables, gifting, and slow moments at home.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.55}>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/shop"
                className="bg-[#B69A66] text-[#10291F] font-semibold text-xs tracking-[0.2em] px-8 py-4 uppercase hover:bg-[#C7AD78] transition-all duration-300 flex items-center gap-3 group"
              >
                <span>EXPLORE WALNUTS</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <a
                href="#story"
                className="text-xs tracking-[0.2em] text-[#E7E7DC] hover:text-[#B69A66] uppercase px-4 py-4 transition-colors flex items-center gap-2"
              >
                <span>OUR STORY</span>
                <span className="text-[#B69A66]">→</span>
              </a>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.7}>
            <div className="grid grid-cols-2 gap-6 pt-10 mt-12 border-t border-[#345043]/60 text-xs tracking-wider">
              <div>
                <span className="block text-[10px] text-[#9EAFA2] uppercase tracking-widest mb-1">ORIGIN</span>
                <strong className="text-[#F0EEE4] font-medium">{product?.origin || "KASHMIR, INDIA"}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-[#9EAFA2] uppercase tracking-widest mb-1">INGREDIENT</span>
                <strong className="text-[#F0EEE4] font-medium">100% IN-SHELL WALNUTS</strong>
              </div>
            </div>
          </FadeInUp>
        </div>

        <div className="lg:col-span-6 h-[480px] lg:h-full relative overflow-hidden">
          <ImageMaskReveal className="w-full h-full" delay={0.3} direction="left">
            <ParallaxImage src={images[0]} alt="Whole Kashmiri Walnuts in Shell" className="w-full h-full min-h-[500px]" />
          </ImageMaskReveal>
          <div className="absolute inset-0 bg-gradient-to-r from-[#10291F] via-transparent to-transparent hidden lg:block pointer-events-none opacity-80" />
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="bg-[#F6F2E9] border-y border-[#D4CABB] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-[11px] tracking-[0.2em] uppercase text-[#68452F]">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#B69A66]" /> HANDPICKED HARVEST
          </span>
          <span className="flex items-center gap-2">
            <Leaf size={14} className="text-[#B69A66]" /> 100% UNBLEACHED NATURAL SHELLS
          </span>
          <span className="flex items-center gap-2">
            <Truck size={14} className="text-[#B69A66]" /> PAN-INDIA COURIER DELIVERY
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#B69A66]" /> FOOD-GRADE FRESHNESS PACKAGING
          </span>
        </div>
      </div>

      {/* SECTION B — BRAND STATEMENT */}
      <section className="py-24 lg:py-36 px-6 sm:px-12 max-w-6xl mx-auto text-center">
        <FadeInUp>
          <span className="text-[10px] tracking-[0.3em] text-[#B69A66] uppercase font-bold block mb-4">
            KASHURMEWA MANIFESTO
          </span>
        </FadeInUp>
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif leading-[1.05] tracking-tight text-[#30231C] mb-8">
          <TextWordReveal text="Good things begin with nature." delay={0.2} />
        </h2>
        <FadeInUp delay={0.4}>
          <p className="text-base sm:text-lg text-[#68452F] max-w-2xl mx-auto font-light leading-relaxed">
            We believe that the best dry fruits require minimal intervention. Our walnuts are harvested in the temperate orchards of Kashmir, sorted carefully, and packed without chemical washing or bleach.
          </p>
        </FadeInUp>
      </section>

      {/* SECTION C — FULL-BLEED IMAGE STORY */}
      <section id="origin" className="relative h-[65vh] min-h-[500px] overflow-hidden">
        <ParallaxImage
          src={images[1] || HERO_IMAGES[1]}
          alt="Kashmiri Walnut Orchard"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-[#10291F]/40 flex items-end p-8 sm:p-16">
          <FadeInUp className="text-[#F5F0E5] max-w-xl">
            <span className="text-[10px] tracking-[0.25em] text-[#B69A66] uppercase font-semibold block mb-2">
              MOUNTAIN ORCHARDS
            </span>
            <h3 className="text-3xl sm:text-5xl font-serif leading-tight">
              Shaped by high altitude and snowmelt waters.
            </h3>
          </FadeInUp>
        </div>
      </section>

      {/* SECTION D — FEATURED PRODUCT SHOWCASE */}
      <section id="shop" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-[#B69A66] uppercase font-bold block mb-2">
              SIGNATURE SELECTION
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif text-[#30231C] leading-none">
              The everyday <i className="italic text-[#344B3A]">luxury.</i>
            </h2>
          </div>
          <p className="text-sm text-[#68452F] max-w-xs font-light leading-relaxed">
            One pure ingredient. Choose your preferred weight configuration and enjoy authentic Kashmiri walnuts delivered fresh.
          </p>
        </div>

        {productLoading ? (
          <div className="py-16 text-sm text-[#747A72]" role="status">Gathering the current collection…</div>
        ) : productError ? (
          <div className="border border-[#E7DED1] bg-[#FFFDF8] p-8 text-sm text-[#68452F]" role="alert">
            We couldn’t load the featured product just now. Please refresh or visit the full shop.
            <Link href="/shop" className="ml-2 underline font-semibold">Open shop →</Link>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Main Product Card */}
            <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#E7DED1] p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="relative h-[380px] sm:h-[460px] bg-[#F7F3EB] overflow-hidden mb-8">
                  <ImageMaskReveal className="w-full h-full" delay={0.2}>
                    <img
                      src={images[1] || images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </ImageMaskReveal>
                  <span className="absolute bottom-4 left-4 bg-[#10291F] text-[#F5F0E5] text-[10px] tracking-widest px-3 py-1.5 uppercase font-semibold">
                    100% IN-SHELL WALNUTS
                  </span>
                </div>
                <small className="text-[10px] tracking-[0.2em] text-[#B69A66] uppercase font-bold block mb-2">
                  AUTHENTIC KASHMIRI HARVEST
                </small>
                <h3 className="text-3xl sm:text-4xl font-serif text-[#30231C] mb-4">{product.name}</h3>
                <p className="text-sm text-[#68452F] leading-relaxed font-light mb-6">{product.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[#E7DED1] pt-6">
                <Link
                  href="/products/kashmiri-walnuts"
                  className="text-xs tracking-[0.15em] text-[#344B3A] font-semibold uppercase hover:text-[#B69A66] flex items-center gap-2"
                >
                  <span>VIEW DETAILED SPECIFICATIONS</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            {/* Buying Panel */}
            <div className="lg:col-span-5 bg-[#10291F] text-[#F5F0E5] p-8 sm:p-12 flex flex-col justify-between border border-[#345043]">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-[#B69A66] uppercase font-bold block mb-2">
                  SELECT PACK SIZE
                </span>
                <h3 className="text-3xl sm:text-4xl font-serif mb-8 text-[#F5F0E5]">
                  Choose your <i className="italic text-[#B69A66]">ritual.</i>
                </h3>

                <div className="space-y-4 mb-8">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={v.stock <= 0}
                      onClick={() => setSize(v.size)}
                      className={`w-full p-4 border text-left flex justify-between items-center transition-all duration-300 ${
                        selectedVariant?.id === v.id
                          ? "border-[#B69A66] bg-[#345043]/40 text-[#FFFDF8]"
                          : "border-[#345043] bg-transparent text-[#C0C9C0] hover:border-[#B69A66]/60"
                      }`}
                    >
                      <div>
                        <span className="font-serif text-xl block">{v.size} Pack</span>
                        <small className="text-[9px] tracking-widest text-[#B69A66] uppercase">
                          {v.stock > 0 ? "AVAILABLE · READY TO SHIP" : "SOLD OUT"}
                        </small>
                      </div>
                      <strong className="font-serif text-2xl text-[#F5F0E5]">
                        ₹{Number(v.price_inr).toLocaleString("en-IN")}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between border-t border-[#345043] pt-6 mb-6">
                  <div>
                    <span className="text-[10px] text-[#9EAFA2] uppercase block tracking-wider">TOTAL PRICE</span>
                    <strong className="text-3xl font-serif text-[#F5F0E5]">
                      ₹{selectedVariant ? Number(selectedVariant.price_inr).toLocaleString("en-IN") : "—"}
                    </strong>
                  </div>
                  <button
                    onClick={addToBag}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className="bg-[#B69A66] text-[#10291F] font-semibold text-xs tracking-[0.15em] px-6 py-4 uppercase hover:bg-[#C7AD78] transition-colors disabled:opacity-40"
                  >
                    {selectedVariant && selectedVariant.stock > 0 ? "ADD TO BAG +" : "OUT OF STOCK"}
                  </button>
                </div>

                <AnimatePresence>
                  {notice && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-[#345043] text-[#F5F0E5] text-xs p-3 flex items-center justify-between mb-4 border border-[#B69A66]"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#B69A66]" /> {notice}
                      </span>
                      <Link href="/cart" className="underline font-semibold text-[#B69A66]">
                        View bag →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[10px] tracking-wider text-[#9EAFA2] uppercase">
                  ✓ Secure checkout · Freshly packed · Pan-India delivery
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-sm text-[#747A72]">This product is temporarily unavailable. Please explore the shop for current availability.</div>
        )}
      </section>

      {/* SECTION E — PRODUCT DETAIL STORY */}
      <section className="py-24 bg-[#EAE2D3] border-y border-[#D4CABB]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="text-[10px] tracking-[0.25em] text-[#B69A66] uppercase font-bold block mb-3">
              UNBLEACHED INTEGRITY
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif text-[#30231C] leading-tight mb-6">
              Why hard shells <br />
              <i className="italic text-[#344B3A]">matter.</i>
            </h2>
            <p className="text-sm sm:text-base text-[#68452F] leading-relaxed font-light mb-8 max-w-xl">
              Walnuts in their natural, unbroken hard shells act as nature’s vault. The hard shell shields kernel oil from light and oxygen, preventing rancidity without artificial antioxidants or chemical preservatives.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#D4CABB]">
              <div>
                <strong className="block font-serif text-2xl text-[#30231C] mb-1">01. Net Weight</strong>
                <p className="text-xs text-[#68452F] leading-relaxed">
                  Net weight declarations represent total weight of in-shell walnuts.
                </p>
              </div>
              <div>
                <strong className="block font-serif text-2xl text-[#30231C] mb-1">02. Shelf Life</strong>
                <p className="text-xs text-[#68452F] leading-relaxed">
                  Stays fresh up to 6 months in cool, dry storage conditions.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 h-[450px]">
            <ImageMaskReveal className="w-full h-full" delay={0.2} direction="right">
              <img
                src={images[2] || HERO_IMAGES[2]}
                alt="Walnut Detail"
                className="w-full h-full object-cover shadow-2xl"
              />
            </ImageMaskReveal>
          </div>
        </div>
      </section>

      {/* SECTION F — THE BRAND STORY */}
      <section id="story" className="py-24 lg:py-36 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 h-[520px]">
            <ImageMaskReveal className="w-full h-full" delay={0.1}>
              <img src={images[0]} alt="Kashmir Landscape" className="w-full h-full object-cover" />
            </ImageMaskReveal>
          </div>
          <div className="lg:col-span-6">
            <FadeInUp>
              <span className="text-[10px] tracking-[0.25em] text-[#B69A66] uppercase font-bold block mb-3">
                THE KASHURMEWA JOURNEY
              </span>
              <h2 className="text-4xl sm:text-6xl font-serif text-[#30231C] leading-none mb-8">
                From the valley <br />
                <i className="italic text-[#344B3A]">to your table.</i>
              </h2>
              <p className="text-sm sm:text-base text-[#68452F] font-light leading-relaxed mb-6">
                Kashurmewa was founded to bridge the gap between mountain orchards in Kashmir and food lovers seeking pure, uncompromised staples.
              </p>
              <p className="text-sm sm:text-base text-[#68452F] font-light leading-relaxed mb-8">
                By focusing exclusively on natural walnut quality, transparent packaging, and fast pan-India delivery, we bring the true character of the valley straight to your home.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-semibold text-[#10291F] border-b border-[#10291F] pb-2 hover:text-[#B69A66] hover:border-[#B69A66] transition-colors"
              >
                <span>DISCOVER OUR PHILOSOPHY</span>
                <ArrowUpRight size={16} />
              </Link>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* SECTION H — FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#FFFDF8] border-t border-[#E7DED1]">
        <div className="max-w-4xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[0.25em] text-[#B69A66] uppercase font-bold block mb-3">
              CLEAR ANSWERS
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif text-[#30231C]">
              Frequently asked <i className="italic text-[#344B3A]">questions.</i>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Why are Kashmiri walnuts considered superior?",
                a: "Kashmir has a long tradition of walnut growing. Each harvest can vary naturally in size, shell texture, and flavour—part of what makes seasonal produce distinctive.",
              },
              {
                q: "How should I store in-shell walnuts after delivery?",
                a: "Keep walnuts in a cool, dry place away from direct heat and humidity. Natural hard shells shield the kernels. After cracking, store kernels in an airtight container or refrigerator.",
              },
              {
                q: "What is your shipping timeline across India?",
                a: "Orders are processed within 24-48 hours. Express courier delivery takes 3-5 business days for metro cities and 5-7 business days for regional pin codes. Free delivery applies on orders above ₹999.",
              },
              {
                q: "Are the walnut shells chemically bleached or treated?",
                a: "Our product is presented as natural in-shell walnuts. Please refer to the product packaging for the specific handling and ingredient information for your batch.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-[#E7DED1] bg-[#FAF8F2] overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center font-serif text-xl text-[#30231C] hover:text-[#344B3A] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 text-[#B69A66] ${
                      activeFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-sm text-[#68452F] leading-relaxed font-light border-t border-[#E7DED1]/60 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION I — FINAL SHOPPING MOMENT */}
      <section className="py-24 bg-[#10291F] text-[#F5F0E5] text-center px-6">
        <div className="max-w-3xl mx-auto">
          <FadeInUp>
            <span className="text-[10px] tracking-[0.3em] text-[#B69A66] uppercase font-bold block mb-4">
              THE KASHURMEWA EXPERIENCE
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif leading-tight mb-8">
              Bring the taste of Kashmir to your everyday table.
            </h2>
            <Link
              href="/shop"
              className="inline-block bg-[#B69A66] text-[#10291F] font-semibold text-xs tracking-[0.2em] px-10 py-5 uppercase hover:bg-[#C7AD78] transition-colors"
            >
              SHOP KASHMIRI WALNUTS NOW ↗
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* SECTION J — FOOTER */}
      <footer className="bg-[#091E16] text-[#DCE4DC] py-16 px-6 sm:px-12 border-t border-[#345043]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#345043]">
          <div className="md:col-span-5">
            <div className="mb-4">
              <KashurmewLogo variant="light" size="md" />
            </div>
            <p className="text-sm text-[#9FAC9F] max-w-sm font-light leading-relaxed">
              Premium Kashmiri walnuts in shell, sourced directly from high-altitude orchards and delivered fresh across India.
            </p>
          </div>

          <div className="md:col-span-2">
            <small className="block text-[10px] tracking-[0.2em] text-[#819187] uppercase font-bold mb-4">
              SHOP
            </small>
            <div className="flex flex-col gap-3 text-xs text-[#CCD5CE]">
              <Link href="/shop" className="hover:text-[#B69A66] transition-colors">
                All Products
              </Link>
              <Link href="/products/kashmiri-walnuts" className="hover:text-[#B69A66] transition-colors">
                In-Shell Walnuts
              </Link>
              <Link href="/cart" className="hover:text-[#B69A66] transition-colors">
                Bag & Checkout
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <small className="block text-[10px] tracking-[0.2em] text-[#819187] uppercase font-bold mb-4">
              EXPLORE
            </small>
            <div className="flex flex-col gap-3 text-xs text-[#CCD5CE]">
              <Link href="/about" className="hover:text-[#B69A66] transition-colors">
                About Kashurmewa
              </Link>
              <a href="#story" className="hover:text-[#B69A66] transition-colors">
                Our Story
              </a>
              <a href="#origin" className="hover:text-[#B69A66] transition-colors">
                Origin
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <small className="block text-[10px] tracking-[0.2em] text-[#819187] uppercase font-bold mb-4">
              POLICIES & LEGAL
            </small>
            <div className="flex flex-col gap-3 text-xs text-[#CCD5CE]">
              <Link href="/contact" className="hover:text-[#B69A66] transition-colors">
                Contact Support
              </Link>
              <Link href="/policies/shipping" className="hover:text-[#B69A66] transition-colors">
                Shipping & Delivery
              </Link>
              <Link href="/policies/refund" className="hover:text-[#B69A66] transition-colors">
                Returns & Refunds
              </Link>
              <Link href="/policies/privacy" className="hover:text-[#B69A66] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/policies/terms" className="hover:text-[#B69A66] transition-colors">
                Terms of Service
              </Link>
              <Link href="/policies/food-safety" className="hover:text-[#B69A66] transition-colors">
                Food Safety Declarations
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] tracking-widest text-[#809087] uppercase gap-4">
          <span>© 2026 KASHURMEWA. ALL RIGHTS RESERVED.</span>
          <span>AUTHENTIC KASHMIRI DRY FRUITS</span>
          <span>MADE IN INDIA</span>
        </div>
      </footer>
    </main>
  );
}

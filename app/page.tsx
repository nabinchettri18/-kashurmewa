"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Leaf, ShoppingBag } from "lucide-react";
import { fetchAllProducts, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import { getProductImages, WALNUT_PRODUCT_FALLBACK } from "@/lib/product-images";
import { KashurmewLogo } from "@/components/brand/Logo";
import "./kashurmewa-storefront.css";
import "./kashurmewa-brand.css";
import "./kashurmewa-campaign-home.css";

const ORCHARD_IMAGE = "https://images.pexels.com/photos/17765489/pexels-photo-nc-farm-bureau-mark-17765489.jpeg?cs=srgb&dl=pexels-nc-farm-bureau-mark-17765489.jpg&fm=jpg";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function sortedVariants(product: Product) {
  return [...product.variants].sort((a, b) => a.price_inr - b.price_inr);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");
  const addToBagLock = useRef(false);

  useEffect(() => {
    let alive = true;

    fetchAllProducts()
      .then((items) => {
        if (alive) setProducts(items);
      })
      .catch((error) => {
        console.error("Unable to load the live catalogue", error);
        if (alive) setLoadError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    try {
      const saved = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(
        saved.reduce(
          (sum: number, item: { qty?: number }) => sum + Number(item.qty || 0),
          0,
        ),
      );
    } catch {
      setCartCount(0);
    }

    return () => {
      alive = false;
    };
  }, []);

  const heroProduct = useMemo(
    () => products.find((product) => product.images?.length && product.variants?.length),
    [products],
  );
  const heroVariant = heroProduct
    ? sortedVariants(heroProduct).find((variant) => variant.stock > 0) ||
      sortedVariants(heroProduct)[0]
    : undefined;
  const heroImage = heroProduct ? getProductImages(heroProduct.images, heroProduct.name)[0] : { url: WALNUT_PRODUCT_FALLBACK, alt_text: "Whole walnuts in their natural shells", sort_order: 0 };

  function addToBag(product: Product, variant: ProductVariant) {
    if (variant.stock <= 0) {
      setNotice("This option is currently unavailable.");
      return;
    }
    if (addToBagLock.current) return;
    addToBagLock.current = true;
    window.setTimeout(() => { addToBagLock.current = false; }, 700);

    try {
      const saved = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const existing = saved.find(
        (item: { variantId: string }) => item.variantId === variant.id,
      );

      if (existing) {
        if (Number(existing.qty) >= variant.stock) {
          setNotice("Your bag already contains the available quantity.");
          return;
        }
        existing.qty = Number(existing.qty) + 1;
      } else {
        saved.push({ productId: product.id, variantId: variant.id, qty: 1 });
      }

      localStorage.setItem("kashurmewa-cart", JSON.stringify(saved));
      window.dispatchEvent(new Event("kashurmewa-cart-updated"));
      setCartCount(
        saved.reduce(
          (sum: number, item: { qty?: number }) => sum + Number(item.qty || 0),
          0,
        ),
      );
      setNotice(product.name + " added to your bag.");
      window.setTimeout(() => setNotice(""), 2800);
    } catch {
      setNotice("We couldn't update your bag. Please try again.");
    }
  }

  return (
    <main className="km-store km-brand-home km-campaign-home">
      <div className="km-brand-announcement">
        <span>THE TASTE OF KASHMIR</span>
        <span>A sense of place. A place at your table.</span>
      </div>
      <NavigationHeader cartCount={cartCount} />

      {notice && (
        <div className="km-brand-toast" role="status">
          {notice}
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}

      <section className="km-campaign-hero" aria-labelledby="campaign-title">
        <img
          className="km-campaign-backdrop"
          src="/kashurmewa-heritage-landscape.svg"
          alt=""
          fetchPriority="high"
        />
        <div className="km-campaign-copy">
          <span className="km-campaign-eyebrow">A considered collection · KASHURMEWA</span>
          <h1 id="campaign-title">
            The Taste
            <br />
            of <em>Kashmir.</em>
          </h1>
          <p>
            A thoughtful world of regional flavours, pantry favourites and
            meaningful finds — inspired by a place, made to feel at home.
          </p>
          <div className="km-campaign-actions">
            <Link href="/shop" className="km-campaign-primary">
              Explore the collection <ArrowRight size={16} />
            </Link>
            <Link href="/about" className="km-campaign-secondary">
              Our story <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="km-campaign-caption">
            <span>ROOTED IN HERITAGE</span>
            <span>MADE FOR MODERN HOMES</span>
          </div>
        </div>

        <div className="km-campaign-visual">
          <div className="km-campaign-photo-frame">
            <img
              src={heroImage.url}
              alt={heroImage.alt_text || heroProduct?.name || "Featured KASHURMEWA walnut product"}
              fetchPriority="high"
              onError={(event) => {
                if (!event.currentTarget.src.includes("8303558")) event.currentTarget.src = WALNUT_PRODUCT_FALLBACK;
              }}
            />
          </div>
          {heroProduct && (
            <div className="km-campaign-product-note">
              <div>
                <small>IN THE CURRENT COLLECTION</small>
                <strong>{heroProduct.name}</strong>
              </div>
              {heroVariant && (
                <span>{money(heroVariant.price_inr)}</span>
              )}
              <Link href={"/products/" + heroProduct.slug} aria-label={"View " + heroProduct.name}>
                <ArrowUpRight size={17} />
              </Link>
            </div>
          )}
          <div className="km-campaign-hero-stamp" aria-hidden="true">
            <b>KM</b>
            <small>THE TASTE OF KASHMIR</small>
          </div>
        </div>
      </section>

      <section className="km-campaign-ribbon" aria-label="Shopping information">
        <div><Check /><span>Clear product details</span></div>
        <div><ShoppingBag /><span>Live prices and pack options</span></div>
        <div><Leaf /><span>Inspired by regional character</span></div>
      </section>

      <section className="km-campaign-intro">
        <span>MORE THAN WHAT’S IN THE BAG</span>
        <h2>
          A little heritage.
          <br />
          <em>A lot of heart.</em>
        </h2>
        <p>
          KASHURMEWA is being built as a premium regional pantry brand — a place
          for flavours, traditions and thoughtful finds that bring a little of
          Kashmir closer to home.
        </p>
      </section>

      <section className="km-campaign-products" id="featured">
        <div className="km-campaign-section-head">
          <div>
            <span>THE COLLECTION, AS IT GROWS</span>
            <h2>
              Discover what’s <em>on the table.</em>
            </h2>
          </div>
          <Link href="/shop" className="km-campaign-view-all">
            Explore the shop <ArrowUpRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="km-campaign-state" role="status">
            Preparing the current collection…
          </div>
        ) : loadError ? (
          <div className="km-campaign-state" role="alert">
            We couldn’t load the live catalogue. Please visit the{" "}
            <Link href="/shop">shop</Link> or try again shortly.
          </div>
        ) : products.length === 0 ? (
          <div className="km-campaign-state">
            Our collection is being prepared.{" "}
            <Link href="/contact">Contact us</Link> if you have a question.
          </div>
        ) : (
          <div className="km-campaign-product-grid">
            {products.slice(0, 3).map((product) => {
              const variants = sortedVariants(product);
              const available = variants.filter((variant) => variant.stock > 0);
              const firstVariant = available[0] || variants[0];
              const minPrice = variants.length ? variants[0].price_inr : null;
              const image = getProductImages(product.images, product.name)[0];

              return (
                <article className="km-campaign-product" key={product.id}>
                  <Link
                    className="km-campaign-product-image"
                    href={"/products/" + product.slug}
                    aria-label={"View " + product.name}
                  >
                    <img
                      src={image.url}
                      alt={image.alt_text || product.name}
                      loading="lazy"
                      onError={(event) => {
                        if (!event.currentTarget.src.includes("8303558")) event.currentTarget.src = WALNUT_PRODUCT_FALLBACK;
                      }}
                    />
                  </Link>
                  <div className="km-campaign-product-body">
                    <div className="km-campaign-product-meta">
                      <span>KASHURMEWA COLLECTION</span>
                      <span>{variants.length} {variants.length === 1 ? "option" : "options"}</span>
                    </div>
                    <h3>{product.name}</h3>
                    <div className="km-campaign-product-price">
                      <strong>
                        {minPrice === null ? "Price unavailable" : "From " + money(minPrice)}
                      </strong>
                      <small>
                        {variants.length
                          ? variants.map((variant) => variant.size).join(" · ")
                          : "Pack options unavailable"}
                      </small>
                    </div>
                    {firstVariant && firstVariant.stock > 0 ? (
                      <button
                        type="button"
                        onClick={() => addToBag(product, firstVariant)}
                      >
                        Add {firstVariant.size} to bag <ShoppingBag size={14} />
                      </button>
                    ) : (
                      <Link
                        className="km-campaign-product-link"
                        href={"/products/" + product.slug}
                      >
                        View product options <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="km-campaign-products-note">
          <Check size={14} />
          Prices and availability are read from the live catalogue. Delivery
          details are shown before an order is placed.
        </p>
      </section>

      <section className="km-campaign-story">
        <div className="km-campaign-story-visual">
          <img
            src={ORCHARD_IMAGE}
            alt="Sunlit orchard rows"
            loading="lazy"
          />
          <span>THE TASTE OF KASHMIR · A SENSE OF PLACE</span>
        </div>
        <div className="km-campaign-story-copy">
          <span>THE KASHURMEWA POINT OF VIEW</span>
          <h2>
            Good things carry
            <br />
            <em>a sense of place.</em>
          </h2>
          <p>
            We believe the things we bring home can mean more than what’s on
            the label. Our aim is to build a considered collection that honours
            regional character while fitting naturally into modern everyday life.
          </p>
          <Link href="/about">
            Discover our story <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="km-campaign-close">
        <span>KASHURMEWA · THE TASTE OF KASHMIR</span>
        <h2>
          Find something
          <br />
          <em>that feels like home.</em>
        </h2>
        <Link href="/shop">
          Explore the collection <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="km-brand-footer">
        <div className="km-brand-footer-main">
          <div className="km-brand-footer-about">
            <KashurmewLogo variant="light" size="lg" />
            <p>
              A premium regional pantry brand inspired by the tastes, textures
              and traditions that make a place memorable.
            </p>
            <Link href="/contact">
              Questions? Talk to us <ArrowUpRight size={14} />
            </Link>
          </div>
          <div>
            <small>EXPLORE</small>
            <Link href="/shop">Shop the collection</Link>
            <Link href="/cart">Your bag</Link>
            <Link href="/account">My account</Link>
          </div>
          <div>
            <small>THE BRAND</small>
            <Link href="/about">Our story</Link>
            <Link href="/contact">Contact us</Link>
          </div>
          <div>
            <small>HELP &amp; POLICIES</small>
            <Link href="/policies/shipping">Shipping</Link>
            <Link href="/policies/refund">Returns &amp; refunds</Link>
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/terms">Terms</Link>
          </div>
        </div>
        <div className="km-brand-footer-bottom">
          <span>© KASHURMEWA</span>
          <span>THE TASTE OF KASHMIR.</span>
          <Link href="/policies/food-safety">Food safety information</Link>
        </div>
      </footer>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";

type LogoVariant = "dark" | "light";
type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 120, height: 40 },
  md: { width: 160, height: 53 },
  lg: { width: 200, height: 67 },
  xl: { width: 280, height: 93 },
};

interface LogoProps {
  /** "dark" = original colors for light backgrounds, "light" = cream/gold for dark backgrounds */
  variant?: LogoVariant;
  /** Predefined size bucket */
  size?: LogoSize;
  /** Link destination; defaults to "/" */
  href?: string;
  /** Extra className on the wrapper link */
  className?: string;
  /** Whether to render the entrance animation */
  animate?: boolean;
}

/**
 * Official Kashurmewa brand logo.
 * Uses the real logo asset (public/logo.png or public/logo-light.png).
 * Always preserves original proportions — never stretch or distort.
 */
export function KashurmewLogo({
  variant = "dark",
  size = "md",
  href = "/",
  className = "",
  animate = false,
}: LogoProps) {
  const src = variant === "light" ? "/logo-light.png" : "/logo.png";
  const dims = SIZE_MAP[size];

  const img = (
    <Image
      src={src}
      alt="Kashurmewa — Premium Kashmiri Walnuts"
      width={dims.width}
      height={dims.height}
      priority
      className={`kashurmewa-logo-img${animate ? " kashurmewa-logo-reveal" : ""}`}
      style={{ objectFit: "contain", display: "block" }}
      unoptimized
    />
  );

  return (
    <Link
      href={href}
      className={`kashurmewa-logo ${className}`.trim()}
      aria-label="Kashurmewa — Home"
    >
      {img}
    </Link>
  );
}

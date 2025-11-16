"use client";

import React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  as?: "button" | "link";
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function classes({ variant, size, fullWidth }: { variant: Variant; size: Size; fullWidth?: boolean }) {
  const base =
    "inline-flex items-center justify-center font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const radius = "rounded-[var(--radius)]";
  const width = fullWidth ? "w-full" : "";
  const sizes: Record<Size, string> = {
    sm: "text-sm h-10 px-4",
    md: "text-base h-[var(--button-height)] px-5", // 48px por theme
    lg: "text-base h-14 px-6",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-text-light)] hover:opacity-90 focus-visible:ring-[var(--color-primary)]",
    secondary:
      "bg-[var(--color-secondary)] text-[var(--color-text-light)] hover:opacity-90 focus-visible:ring-[var(--color-secondary)]",
    outline:
      "bg-transparent text-[var(--color-text-dark)] border border-[color:var(--color-secondary)]/20 hover:bg-[var(--color-surface)] focus-visible:ring-[var(--color-primary)]",
    ghost:
      "bg-transparent text-[var(--color-text-dark)] hover:bg-[var(--color-surface)] focus-visible:ring-[var(--color-primary)]",
  };

  return [base, radius, width, sizes[size], variants[variant]].join(" ");
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth,
  as = "button",
  href,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const cls =
    classes({ variant, size, fullWidth }) +
    " " +
    (disabled || loading ? "opacity-60 pointer-events-none" : "") +
    " " +
    className;

  const content = (
    <>
      {loading && (
        <svg
          className="mr-2 animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
          <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      )}
      {children}
    </>
  );

  if (as === "link" && href) {
    return (
      <Link
        href={href}
        className={cls}
        role="button"
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}

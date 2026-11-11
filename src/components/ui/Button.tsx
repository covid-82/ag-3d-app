import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-clay text-white hover:bg-clay-dark border border-clay shadow-2xs active:scale-[0.98]",
  accent: "bg-clay text-white hover:bg-clay-dark border border-clay shadow-2xs active:scale-[0.98]",
  outline: "bg-transparent text-clay border border-clay hover:bg-clay/10 active:scale-[0.98]",
  secondary: "bg-paper-2 text-ink border border-line hover:bg-paper-3 active:scale-[0.98]",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-paper-2 active:scale-[0.98]",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs font-medium",
  md: "h-9.5 px-4.5 text-sm font-medium",
  lg: "h-10.5 px-5.5 text-sm font-medium",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none whitespace-nowrap w-auto shrink-0 ${VARIANT[variant]} ${SIZE[size]} ${extra}`;
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const cls = buttonClass(variant, size, className);
  if (href) {
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-moss border border-ink",
  accent: "bg-clay text-white hover:bg-clay-dark border border-clay",
  outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-paper-2",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none whitespace-nowrap ${VARIANT[variant]} ${SIZE[size]} ${extra}`;
}

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({ variant, size, href, external, className, children, ...rest }: Props) {
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

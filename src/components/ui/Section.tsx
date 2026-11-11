import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-clay">{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-display text-3xl font-medium leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-[2.6rem]">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{description}</p>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-paper-2">
      <Container className="pb-12 pt-14 sm:pb-16 sm:pt-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{description}</p>}
      </Container>
    </header>
  );
}

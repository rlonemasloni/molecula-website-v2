import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  lead,
  trail,
}: {
  lead: string;
  trail?: string;
}) {
  return (
    <h2 className="max-w-3xl text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
      {lead}{" "}
      {trail ? <span className="text-muted-foreground">{trail}</span> : null}
    </h2>
  );
}

export function Keycap({ children }: { children: ReactNode }) {
  return <span className="keycap text-foreground">{children}</span>;
}

export function PillButton({
  children,
  variant = "primary",
  href = "#contact",
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200";
  const styles =
    variant === "primary"
      ? "bg-[#5D00FF] text-white shadow-[0_8px_24px_-4px_rgba(93,0,255,0.35)] hover:bg-[#4C00D4] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(93,0,255,0.45)]"
      : "border border-border bg-white text-foreground shadow-xs hover:border-[#5D00FF]/40 hover:bg-purple-50/70 hover:text-[#5D00FF] dark:bg-[#121218] dark:border-white/10 dark:text-white dark:hover:bg-purple-950/40 dark:hover:border-purple-500/40";

  return (
    <a href={href} className={`${base} ${styles} ${className}`.trim()}>
      {children}
    </a>
  );
}

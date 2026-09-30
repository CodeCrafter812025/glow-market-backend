import type { ReactNode } from "react";
import Header from "@/components/Header";

interface InfoPageLayoutProps {
  /** Persian page title shown in the pastel hero band. */
  title: string;
  /** Short supporting line under the title. */
  subtitle: string;
  children: ReactNode;
}

/**
 * Shared shell for the static information pages (About, Contact, Terms,
 * Refund Policy) so they all share one RTL reading layout and the same
 * pastel hero treatment as the rest of the marketplace.
 */
export default function InfoPageLayout({ title, subtitle, children }: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header />

      <main>
        {/* Pastel hero band */}
        <section className="bg-gradient-to-b from-accent/35 via-secondary/25 to-background border-b border-border/40">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-right">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </section>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-3xl text-right">{children}</div>
        </div>
      </main>
    </div>
  );
}

interface InfoSectionProps {
  heading: string;
  children: ReactNode;
}

/** A titled content block used inside InfoPageLayout. */
export function InfoSection({ heading, children }: InfoSectionProps) {
  return (
    <section className="mb-9">
      <h2 className="text-xl font-semibold text-foreground mb-3">{heading}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
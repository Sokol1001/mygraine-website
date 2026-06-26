"use client";

import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n";

export default function Stats() {
  const { t } = useLanguage();
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-3 gap-10 md:gap-8">
        {t.stats.items.map((s, i) => (
          <Reveal key={i} delay={i * 120}>
            <div className="border-t-2 border-ink pt-6">
              <div className="font-display font-bold text-6xl md:text-7xl tracking-tight text-ink">
                {s.value}
              </div>
              <p className="mt-4 text-base md:text-lg text-ink-soft max-w-xs leading-relaxed">
                {s.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

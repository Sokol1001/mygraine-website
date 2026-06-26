"use client";

import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n";

export default function BigStatement() {
  const { t } = useLanguage();
  return (
    <section className="bg-ink text-paper py-28 md:py-40 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <Reveal>
          <p className="font-display font-medium text-3xl md:text-5xl lg:text-[3.4rem] leading-[1.12] tracking-tight">
            {t.statement.text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

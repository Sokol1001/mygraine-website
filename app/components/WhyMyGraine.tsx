"use client";

import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n";

export default function WhyMyGraine() {
  const { t } = useLanguage();
  const reasons = t.why.reasons;
  return (
    <section id="about" className="py-24 md:py-32 bg-paper">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-24 items-start">
        <Reveal className="lg:sticky lg:top-32">
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.04] tracking-tight text-ink">
            {t.why.headingPrefix}
            <span className="text-violet" dir="ltr">Mygraine AI</span>
            {t.why.headingSuffix}
          </h2>
          <a
            href="#waitlist"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group mt-9 inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-paper rounded-full text-base font-medium hover:bg-violet transition-colors"
          >
            {t.common.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </a>
        </Reveal>

        <div>
          {reasons.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 100}>
              <div className="border-t border-line py-9 first:border-t-0 first:pt-0 flex gap-6">
                <span className="font-display text-sm tabular-nums text-violet pt-1.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-2xl text-ink mb-3">
                    {reason.title}
                  </h3>
                  <p className="text-base md:text-lg text-ink-soft leading-relaxed max-w-lg">
                    {reason.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

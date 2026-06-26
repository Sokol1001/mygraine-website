"use client";

import { ArrowRight } from "lucide-react";
import PhoneFrame from "./PhoneFrame";
import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { t } = useLanguage();

  const scrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className="relative bg-paper pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
      {/* Soft accent glow */}
      <div
        className="pointer-events-none absolute -top-40 end-[-10%] w-[40rem] h-[40rem] rounded-full bg-lilac blur-3xl opacity-70"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
        <div>
          <h1 className="font-display font-bold text-[3rem] sm:text-6xl lg:text-[4.6rem] leading-[1.02] tracking-tight text-ink">
            {t.hero.titlePrefix}
            <span className="relative inline-block text-violet">
              {t.hero.titleHighlight}
              <svg
                className="absolute inset-x-0 -bottom-2 w-full"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8 Q 26 3, 50 7 T 100 7 T 150 7 T 197 5"
                  fill="none"
                  stroke="#5b5bd6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-ink-soft max-w-xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="mt-10">
            <a
              href="#waitlist"
              onClick={scrollToWaitlist}
              className="group inline-flex items-center gap-2 px-7 py-4 bg-ink text-paper rounded-full text-base font-medium hover:bg-violet transition-colors"
            >
              {t.common.cta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </a>
          </div>
        </div>

        {/* Phone visual */}
        <div className="relative flex justify-center lg:justify-end">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20rem] h-[88%] bg-ink rounded-[3rem]"
            aria-hidden="true"
          />
          <div className="relative w-60 md:w-72 mt-6 rotate-2">
            <PhoneFrame src="/screenshots/resilience-score.png" alt={t.hero.phoneAlt} />
          </div>
        </div>
      </div>
    </section>
  );
}

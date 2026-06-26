"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import PhoneFrame from "./PhoneFrame";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { t } = useLanguage();
  const glowRef = useRef<HTMLDivElement>(null);

  // Light parallax on the decorative glow (Hub71-style depth on scroll).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (glowRef.current) glowRef.current.style.transform = `translateY(${y * 0.18}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      className="relative bg-paper min-h-[92vh] flex items-center pt-32 pb-20 overflow-hidden"
    >
      {/* Parallax accent glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -top-40 end-[-10%] w-[42rem] h-[42rem] rounded-full bg-lilac blur-3xl opacity-70 will-change-transform"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
        <div>
          <Reveal>
            <h1 className="font-display font-bold text-[3rem] sm:text-6xl lg:text-[4.6rem] leading-[1.02] tracking-tight text-ink">
              {t.hero.titlePrefix}
              <span className="relative inline-block text-violet pb-[0.14em]">
                {t.hero.titleHighlight}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[0.07em] rounded-full bg-violet"
                />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 text-lg md:text-xl text-ink-soft max-w-xl leading-relaxed">
              {t.hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={280}>
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
          </Reveal>
        </div>

        {/* Phone visual */}
        <Reveal delay={200} className="relative flex justify-center lg:justify-end">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[19rem] md:w-[21rem] h-[86%] bg-lilac rounded-t-[11rem]"
            aria-hidden="true"
          />
          <div className="relative w-60 md:w-72 mt-6 rotate-2">
            <div className="animate-float">
              <PhoneFrame src="/screenshots/resilience-score.png" alt={t.hero.phoneAlt} />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <a
        href="#features"
        onClick={scrollToFeatures}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink/40 hover:text-ink transition-colors animate-float"
      >
        <ChevronDown className="w-7 h-7" />
      </a>
    </section>
  );
}

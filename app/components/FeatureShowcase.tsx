"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n";

const ROTATE_MS = 3200;

export default function FeatureShowcase() {
  const { t } = useLanguage();
  const benefits = t.features.benefits;
  const shots = [
    { src: "/screenshots/ai-avatar.png", alt: t.features.alts.avatar },
    { src: "/screenshots/clinical-intake.png", alt: t.features.alts.intake },
    { src: "/screenshots/diagnostic-results.png", alt: t.features.alts.results },
    { src: "/screenshots/mygraine-protocol.png", alt: t.features.alts.protocol },
    { src: "/screenshots/resilience-score.png", alt: t.features.alts.resilience },
    { src: "/screenshots/education-hub.png", alt: t.features.alts.education },
  ];

  const [shot, setShot] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setShot((s) => (s + 1) % shots.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [shots.length]);

  // 6 screens map onto 3 benefits (2 each) so the highlight tracks the phone.
  const activeBenefit = Math.floor(shot / 2) % benefits.length;

  return (
    <section
      id="features"
      className="py-24 md:py-32 bg-mist border-t border-line overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <Reveal className="max-w-3xl mb-14">
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.04] tracking-tight text-ink">
            {t.features.headingPrefix}
            <span className="text-violet" dir="ltr">Mygraine AI</span>
            {t.features.headingSuffix}
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
          {/* Benefits — highlight tracks the phone */}
          <div className="order-2 lg:order-1">
            {benefits.map((benefit, i) => {
              const active = i === activeBenefit;
              return (
                <Reveal key={i} delay={i * 120}>
                  <div
                    className={`flex gap-5 items-baseline border-t border-line py-7 transition-all duration-500 ${
                      active ? "opacity-100" : "opacity-45"
                    }`}
                  >
                    <span
                      className={`font-display text-sm tabular-nums shrink-0 transition-colors duration-500 ${
                        active ? "text-violet" : "text-ink/40"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-display font-semibold text-xl md:text-2xl text-ink leading-snug">
                      {benefit}
                    </p>
                  </div>
                </Reveal>
              );
            })}
            <div className="border-t border-line" />
          </div>

          {/* Phone with crossfading screens */}
          <Reveal className="order-1 lg:order-2">
            <div className="relative bg-lilac rounded-[2.5rem] px-10 pt-12 pb-0 flex justify-center overflow-hidden">
              <div className="relative w-56 md:w-64 -rotate-1 translate-y-6 animate-float">
                <div className="relative rounded-[2.25rem] border-[8px] border-ink bg-ink shadow-2xl shadow-ink/20 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink rounded-b-2xl z-10" />
                  {/* sizer keeps the frame height stable */}
                  <img src={shots[0].src} alt="" aria-hidden="true" className="block w-full h-auto invisible" />
                  {shots.map((s, i) => (
                    <img
                      key={s.src}
                      src={s.src}
                      alt={s.alt}
                      className={`absolute inset-0 w-full h-auto transition-opacity duration-700 ${
                        i === shot ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* progress dots */}
              <div className="absolute bottom-5 inset-x-0 flex justify-center gap-1.5 z-10">
                {shots.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === shot ? "w-5 bg-ink" : "w-1.5 bg-ink/25"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

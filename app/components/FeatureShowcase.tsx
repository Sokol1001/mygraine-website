"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const benefits = [
  "לומדת ומבינה את התקפי המיגרנה שלך",
  "מתאימה לך תוכנית טיפולית שנתפרה עבורך באופן אישי",
  "מסייעת למנוע את ההתקף הבא באמצעות הדרכה שוטפת",
];

const screenshots = [
  { src: "/screenshots/ai-avatar.png", alt: "מסך האוואטר של Mygraine AI" },
  { src: "/screenshots/clinical-intake.png", alt: "מסך תשאול קליני של Mygraine AI" },
  { src: "/screenshots/diagnostic-results.png", alt: "מסך תוצאות אבחון של Mygraine AI" },
  { src: "/screenshots/mygraine-protocol.png", alt: "מסך תוכנית הטיפול של Mygraine AI" },
  { src: "/screenshots/resilience-score.png", alt: "מסך מדד החוסן של Mygraine AI" },
  { src: "/screenshots/education-hub.png", alt: "מסך מרכז הידע של Mygraine AI" },
];

const ROTATE_MS = 4000;

export default function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(
      () => setActive((i) => (i + 1) % screenshots.length),
      ROTATE_MS
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <section id="features" className="py-24 md:py-32 bg-paper border-t border-line overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="mb-14 max-w-2xl">
          <h2 className="text-3xl md:text-5xl leading-[1.15] text-ink tracking-tight">
            מה עושה עבורך אפליקציית{" "}
            <span className="text-violet" dir="ltr">Mygraine AI</span>?
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
          {/* Numbered list */}
          <div className="order-2 lg:order-1">
            {benefits.map((benefit, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="border-t border-line py-7 flex gap-6 items-baseline">
                  <span className="text-sm tabular-nums text-violet shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p
                    className="text-xl md:text-2xl text-ink leading-relaxed"
                    style={{ fontFamily: "var(--font-family-display)" }}
                  >
                    {benefit}
                  </p>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-line" />
          </div>

          {/* Phone on lilac panel with crossfading screens */}
          <Reveal className="order-1 lg:order-2">
            <div className="relative bg-lilac rounded-[2.5rem] px-10 pt-12 pb-0 flex justify-center overflow-hidden">
              <div className="relative w-56 md:w-64 -rotate-1 translate-y-6">
                <div className="relative rounded-[2.25rem] border-[8px] border-ink bg-ink shadow-2xl shadow-ink/20 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink rounded-b-2xl z-10" />
                  <img
                    src={screenshots[0].src}
                    alt=""
                    aria-hidden="true"
                    className="block w-full h-auto invisible"
                  />
                  {screenshots.map((shot, i) => (
                    <img
                      key={shot.src}
                      src={shot.src}
                      alt={shot.alt}
                      className={`absolute inset-0 w-full h-auto transition-opacity duration-700 ${
                        i === active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

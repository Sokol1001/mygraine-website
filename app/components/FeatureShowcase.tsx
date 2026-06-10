"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const features = [
  {
    title: "AI Neurologist",
    description:
      "Talk through your symptoms in a natural voice conversation with our AI neurologist avatar.",
    screenshot: "/screenshots/ai-avatar.png",
    alt: "Mygraine AI neurologist avatar screen",
  },
  {
    title: "Clinical Intake",
    description:
      "A guided, clinically structured intake captures your full migraine history in minutes.",
    screenshot: "/screenshots/clinical-intake.png",
    alt: "Mygraine AI clinical intake screen",
  },
  {
    title: "Diagnostic Results",
    description:
      "A clear, ICHD-3 compliant assessment of your migraine type and what it actually means.",
    screenshot: "/screenshots/diagnostic-results.png",
    alt: "Mygraine AI diagnostic results screen",
  },
  {
    title: "Personalized Protocol",
    description:
      "A treatment protocol tailored to your triggers, your lifestyle, and your migraine profile.",
    screenshot: "/screenshots/mygraine-protocol.png",
    alt: "Mygraine AI personalized protocol screen",
  },
  {
    title: "Resilience Score",
    description:
      "One score that tracks how protected you are today — and how to raise it tomorrow.",
    screenshot: "/screenshots/resilience-score.png",
    alt: "Mygraine AI resilience score screen",
  },
  {
    title: "Education Hub",
    description:
      "Bite-sized, expert-reviewed lessons that help you understand your own condition.",
    screenshot: "/screenshots/education-hub.png",
    alt: "Mygraine AI education hub screen",
  },
];

const ROTATE_MS = 5000;

export default function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(
      () => setActive((i) => (i + 1) % features.length),
      ROTATE_MS
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const select = (i: number) => {
    setActive(i);
    setPaused(true);
  };

  return (
    <section id="features" className="py-24 md:py-32 bg-paper border-t border-line overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="mb-16 max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-ink/50 mb-5">
            <span className="text-violet" aria-hidden="true">&#10042;</span>
            Inside the app
          </p>
          <h2 className="text-3xl md:text-5xl leading-[1.08] text-ink tracking-tight">
            Everything between the attack{" "}
            <em className="text-violet font-normal">and the answer.</em>
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
          {/* Left - numbered editorial list */}
          <div className="order-2 lg:order-1">
            {features.map((feature, i) => {
              const isActive = i === active;
              return (
                <button
                  key={feature.title}
                  onClick={() => select(i)}
                  className="group w-full text-left border-t border-line py-5 flex gap-6 items-baseline transition-colors"
                >
                  <span
                    className={`text-sm tabular-nums transition-colors ${
                      isActive ? "text-violet" : "text-ink/35"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-xl md:text-2xl transition-colors ${
                        isActive ? "text-violet" : "text-ink group-hover:text-violet"
                      }`}
                      style={{ fontFamily: "var(--font-family-display)" }}
                    >
                      {feature.title}
                    </span>
                    <span
                      className={`block text-sm text-ink/55 leading-relaxed overflow-hidden transition-all duration-500 ${
                        isActive ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0"
                      }`}
                    >
                      {feature.description}
                    </span>
                  </span>
                  <span
                    className={`text-violet transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  >
                    &#10042;
                  </span>
                </button>
              );
            })}
            <div className="border-t border-line" />
          </div>

          {/* Right - phone on lilac panel */}
          <Reveal className="order-1 lg:order-2">
            <div className="relative bg-lilac rounded-[2.5rem] px-10 pt-12 pb-0 flex justify-center overflow-hidden">
              <div className="relative w-56 md:w-64 -rotate-1 translate-y-6">
                {/* Reserve height with the first screenshot, crossfade the rest */}
                <div className="relative rounded-[2.25rem] border-[8px] border-ink bg-ink shadow-2xl shadow-ink/20 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink rounded-b-2xl z-10" />
                  <img
                    src={features[0].screenshot}
                    alt=""
                    aria-hidden="true"
                    className="block w-full h-auto invisible"
                  />
                  {features.map((feature, i) => (
                    <img
                      key={feature.screenshot}
                      src={feature.screenshot}
                      alt={feature.alt}
                      className={`absolute inset-0 w-full h-auto transition-opacity duration-500 ${
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

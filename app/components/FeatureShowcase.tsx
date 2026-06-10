"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ClipboardList,
  FileSearch,
  HeartPulse,
  Gauge,
  BookOpen,
} from "lucide-react";
import Reveal from "./Reveal";

const features = [
  {
    icon: Bot,
    title: "AI Neurologist",
    description:
      "Talk through your symptoms in a natural voice conversation with our AI neurologist avatar.",
    screenshot: "/screenshots/ai-avatar.png",
    alt: "Mygraine AI neurologist avatar screen",
  },
  {
    icon: ClipboardList,
    title: "Clinical Intake",
    description:
      "A guided, clinically structured intake captures your full migraine history in minutes.",
    screenshot: "/screenshots/clinical-intake.png",
    alt: "Mygraine AI clinical intake screen",
  },
  {
    icon: FileSearch,
    title: "Diagnostic Results",
    description:
      "Receive a clear, ICHD-3 compliant assessment of your migraine type and what it means.",
    screenshot: "/screenshots/diagnostic-results.png",
    alt: "Mygraine AI diagnostic results screen",
  },
  {
    icon: HeartPulse,
    title: "Personalized Protocol",
    description:
      "Get a treatment protocol tailored to your triggers, lifestyle, and migraine profile.",
    screenshot: "/screenshots/mygraine-protocol.png",
    alt: "Mygraine AI personalized protocol screen",
  },
  {
    icon: Gauge,
    title: "Resilience Score",
    description:
      "One score that tracks how protected you are today — and how to raise it tomorrow.",
    screenshot: "/screenshots/resilience-score.png",
    alt: "Mygraine AI resilience score screen",
  },
  {
    icon: BookOpen,
    title: "Education Hub",
    description:
      "Understand your condition with bite-sized, expert-reviewed lessons about migraines.",
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
    <section id="features" className="py-24 md:py-32 px-6 bg-[#f7f7fc] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-sm font-semibold text-[#6267c8] uppercase tracking-[0.2em] mb-3">
            Inside the app
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient">take back control</span>
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">
            From your first conversation to daily prevention — one app for the
            whole journey.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - feature list */}
          <div className="space-y-3 order-2 lg:order-1">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isActive = i === active;
              return (
                <Reveal key={feature.title} delay={i * 60}>
                  <button
                    onClick={() => select(i)}
                    className={`w-full text-left flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? "bg-white border-indigo-200 shadow-xl shadow-indigo-200/40 scale-[1.02]"
                        : "bg-white/40 border-transparent hover:bg-white hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-gradient-brand text-white shadow-lg shadow-indigo-300/40"
                          : "bg-indigo-50 text-[#6267c8]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p
                        className={`text-sm text-gray-500 leading-relaxed transition-all duration-300 ${
                          isActive
                            ? "mt-1 max-h-20 opacity-100"
                            : "max-h-0 opacity-0 overflow-hidden lg:max-h-0"
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                    {/* Progress bar for the active item */}
                    {isActive && !paused && (
                      <div className="hidden lg:block self-center ml-auto w-1 h-10 bg-indigo-100 rounded-full overflow-hidden shrink-0">
                        <div
                          className="w-full bg-gradient-to-b from-[#6267c8] to-[#2a9ee9] rounded-full"
                          style={{
                            animation: `progress-fill ${ROTATE_MS}ms linear`,
                          }}
                        />
                      </div>
                    )}
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Right - phone preview with crossfade */}
          <Reveal className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-72 md:w-80">
              <div
                className="absolute -inset-12 rounded-full bg-gradient-to-tr from-indigo-300/40 via-purple-200/30 to-sky-300/40 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative rounded-[2.75rem] border-[9px] border-gray-900 bg-gray-900 shadow-2xl shadow-indigo-400/30 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
                {/* Stack all screenshots; fade the active one in */}
                <div className="relative">
                  <img
                    src={features[0].screenshot}
                    alt=""
                    aria-hidden="true"
                    className="block w-full h-auto rounded-[2rem] invisible"
                  />
                  {features.map((feature, i) => (
                    <img
                      key={feature.screenshot}
                      src={feature.screenshot}
                      alt={feature.alt}
                      className={`absolute inset-0 w-full h-auto rounded-[2rem] transition-opacity duration-500 ${
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

      <style>{`
        @keyframes progress-fill {
          from { height: 0%; }
          to { height: 100%; }
        }
      `}</style>
    </section>
  );
}

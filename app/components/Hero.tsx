"use client";

import { Sparkles, TrendingUp, ShieldCheck, Stethoscope, ChevronDown } from "lucide-react";
import PhoneFrame from "./PhoneFrame";

export default function Hero() {
  const scrollTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20 md:pt-32 md:pb-24">
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-indigo-200/50 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[38rem] h-[38rem] rounded-full bg-sky-200/50 blur-3xl animate-pulse-glow [animation-delay:1.5s]" />
        <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-purple-200/40 blur-3xl animate-pulse-glow [animation-delay:3s]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(98,103,200,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(98,103,200,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 lg:gap-20 items-center w-full">
        {/* Left - Copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-indigo-100 shadow-sm text-sm font-medium text-[#4e52a0] mb-6">
            <Sparkles className="w-4 h-4" />
            AI-powered migraine care
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
            Outsmart your migraines{" "}
            <span className="text-gradient">before they start</span>
          </h1>

          <p className="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed">
            Track your migraines, get personalized treatment plans, and predict
            attacks before they happen — all powered by AI.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <a
              href="#waitlist"
              onClick={(e) => scrollTo(e, "#waitlist")}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-brand text-white rounded-full text-base font-semibold shadow-xl shadow-indigo-300/50 hover:shadow-indigo-400/60 hover:-translate-y-0.5 transition-all"
            >
              Join the Waiting List
            </a>
            <a
              href="#features"
              onClick={(e) => scrollTo(e, "#features")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur border border-gray-200 text-gray-800 rounded-full text-base font-semibold hover:bg-white hover:border-gray-300 transition-all"
            >
              Explore the app
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6267c8]" />
              ICHD-3 compliant diagnosis
            </span>
            <span className="inline-flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#6267c8]" />
              Built with neurologists
            </span>
          </div>
        </div>

        {/* Right - Phone with floating cards */}
        <div className="flex justify-center">
          <div className="relative w-72 md:w-80">
            {/* Glow behind phone */}
            <div
              className="absolute -inset-10 rounded-full bg-gradient-to-tr from-indigo-300/40 via-purple-200/40 to-sky-300/40 blur-3xl"
              aria-hidden="true"
            />

            <div className="animate-float">
              <PhoneFrame
                src="/screenshots/clinical-intake.png"
                alt="Mygraine AI clinical intake screen"
              />
            </div>

            {/* Floating: Pattern Detected */}
            <div className="absolute bottom-16 -left-10 md:-left-20 bg-white/85 backdrop-blur-xl border border-white/70 px-4 py-3 rounded-2xl shadow-xl shadow-indigo-200/50 flex items-center gap-3 animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#6267c8] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  Pattern Detected
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Preventative action advised
                </p>
              </div>
            </div>

            {/* Floating: Resilience Score */}
            <div className="absolute top-20 -right-8 md:-right-16 bg-white/85 backdrop-blur-xl border border-white/70 px-4 py-3 rounded-2xl shadow-xl shadow-sky-200/50 flex items-center gap-3 animate-float">
              <div className="relative w-10 h-10 shrink-0">
                <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e7e8f2" strokeWidth="4" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="97.4"
                    strokeDashoffset="17.5"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6267c8" />
                      <stop offset="100%" stopColor="#2a9ee9" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-900">
                  82
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  Resilience Score
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Trending up this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

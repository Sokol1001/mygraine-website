"use client";

import { MessageCircle, FileCheck, LineChart } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  {
    icon: MessageCircle,
    step: "01",
    title: "Tell us about your migraines",
    description:
      "Have a natural conversation with our AI neurologist — no forms, no jargon, just talk.",
  },
  {
    icon: FileCheck,
    step: "02",
    title: "Get your diagnosis & plan",
    description:
      "Receive an ICHD-3 compliant assessment and a treatment protocol personalized to you.",
  },
  {
    icon: LineChart,
    step: "03",
    title: "Track, predict, prevent",
    description:
      "Log your days, watch your patterns emerge, and get warned before an attack hits.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-sm font-semibold text-[#6267c8] uppercase tracking-[0.2em] mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            From first chat to fewer migraines
          </h2>
        </Reveal>

        <div className="relative grid md:grid-cols-3 gap-10 md:gap-8">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-200 via-indigo-300 to-sky-200"
            aria-hidden="true"
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.step} delay={i * 140} className="relative">
                <div className="flex flex-col items-center text-center px-4">
                  <div className="relative mb-7">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-xl shadow-indigo-300/40 relative z-10">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-4 z-20 text-xs font-bold text-[#6267c8] bg-white border border-indigo-100 rounded-full px-2.5 py-1 shadow-sm">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-[15px] max-w-xs">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

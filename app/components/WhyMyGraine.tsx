"use client";

import { Bot, GraduationCap, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

const cards = [
  {
    icon: Bot,
    title: "AI-Powered Diagnosis",
    description:
      "Get ICHD-3 compliant migraine assessments through natural voice conversations with our AI neurologist.",
    glow: "from-indigo-400/20 to-purple-400/20",
  },
  {
    icon: GraduationCap,
    title: "Built by Experts",
    description:
      "Developed in collaboration with neurologists and migraine researchers at leading medical centers.",
    glow: "from-purple-400/20 to-sky-400/20",
  },
  {
    icon: Sparkles,
    title: "Smart Predictions",
    description:
      "Our AI learns your patterns to predict migraine attacks before they happen, so you can act early and stay ahead.",
    glow: "from-sky-400/20 to-indigo-400/20",
  },
];

export default function WhyMyGraine() {
  return (
    <section
      id="about"
      className="relative py-24 md:py-32 px-6 bg-[#f7f7fc] overflow-hidden"
    >
      {/* Soft background accents */}
      <div
        className="absolute top-0 left-1/4 w-[28rem] h-[28rem] rounded-full bg-indigo-200/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[24rem] h-[24rem] rounded-full bg-sky-200/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto text-center">
        <Reveal>
          <p className="text-sm font-semibold text-[#6267c8] uppercase tracking-[0.2em] mb-3">
            Why Mygraine AI
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Care that actually understands migraines
          </h2>
          <p className="text-gray-500 mb-16 max-w-2xl mx-auto text-lg">
            Empowering migraine patients with AI-driven insights
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-16">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 120}>
                <div className="group relative h-full bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-indigo-100/40 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/50 hover:border-indigo-100 overflow-hidden">
                  {/* Hover glow */}
                  <div
                    className={`absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br ${card.glow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    aria-hidden="true"
                  />

                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-6 shadow-lg shadow-indigo-300/40 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed text-[15px]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <a
            href="#waitlist"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#waitlist")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-block bg-gradient-brand text-white font-semibold px-9 py-4 rounded-full shadow-xl shadow-indigo-300/50 hover:shadow-indigo-400/60 hover:-translate-y-0.5 transition-all"
          >
            Join the Waiting List
          </a>
        </Reveal>
      </div>
    </section>
  );
}

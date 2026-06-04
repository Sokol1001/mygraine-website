"use client";

import { Bot, GraduationCap, Sparkles } from "lucide-react";

const cards = [
  {
    icon: Bot,
    title: "AI-Powered Diagnosis",
    description:
      "Get ICHD-3 compliant migraine assessments through natural voice conversations with our AI neurologist.",
    gradient: "from-purple-100 via-indigo-50 to-blue-100",
    emphasized: false,
  },
  {
    icon: GraduationCap,
    title: "Built by Experts",
    description:
      "Developed in collaboration with neurologists and migraine researchers at leading medical centers.",
    gradient: "from-blue-100 via-purple-50 to-indigo-100",
    emphasized: true,
  },
  {
    icon: Sparkles,
    title: "Smart Predictions",
    description:
      "Our AI learns your patterns to predict migraine attacks before they happen, so you can act early and stay ahead.",
    gradient: "from-indigo-100 via-purple-50 to-pink-100",
    emphasized: false,
  },
];

export default function WhyMyGraine() {
  return (
    <section
      id="about"
      className="relative bg-gradient-to-b from-gray-50 to-white py-24 px-6"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Why Mygraine AI?
        </h2>
        <p className="text-gray-500 mb-16 max-w-2xl mx-auto">
          Empowering migraine patients with AI-driven insights
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 items-stretch">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`relative bg-white/70 backdrop-blur-xl p-8 border text-left transition-all duration-300 ${
                  card.emphasized
                    ? "border-[#6267c8]/30 shadow-2xl shadow-purple-200/50 md:scale-105 z-10"
                    : "border-gray-200/70 shadow-lg shadow-purple-100/30 hover:-translate-y-1 hover:shadow-xl"
                }`}
              >
                {/* Hero visual area */}
                <div
                  className={`w-full h-40 mb-6 overflow-hidden relative flex items-center justify-center bg-gradient-to-br ${card.gradient}`}
                >
                  <Icon
                    className="w-16 h-16 text-[#6267c8] opacity-80"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        <a
          href="#waitlist"
          onClick={(e) => {
            e.preventDefault();
            document
              .querySelector("#waitlist")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-block bg-[#6267c8] text-white font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
        >
          Join the Waiting List
        </a>
      </div>
    </section>
  );
}

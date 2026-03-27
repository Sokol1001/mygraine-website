"use client";

import { Bot, GraduationCap, Sparkles } from "lucide-react";

const cards = [
  {
    icon: Bot,
    title: "AI-Powered Diagnosis",
    description:
      "Get ICHD-3 compliant migraine assessments through natural voice conversations with our AI neurologist.",
  },
  {
    icon: GraduationCap,
    title: "Built by Experts",
    description:
      "Developed in collaboration with neurologists and migraine researchers at leading medical centers.",
  },
  {
    icon: Sparkles,
    title: "Smart Predictions",
    description:
      "Our AI learns your patterns to predict migraine attacks before they happen, so you can act early and stay ahead.",
  },
];

export default function WhyMyGraine() {
  return (
    <section id="about" className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Why Mygraine AI?
        </h2>
        <p className="text-gray-500 mb-16">
          Empowering migraine patients with AI-driven insights
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="border border-gray-200 rounded-2xl p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-[#6267c8]" />
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
            document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-block bg-[#6267c8] text-white font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Join the Waiting List
        </a>
      </div>
    </section>
  );
}

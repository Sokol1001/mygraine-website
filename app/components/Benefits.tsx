"use client";

import { Brain, HeartPulse, BookOpen } from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "Track & Understand",
    description: "Track your migraines and understand them with our AI technology",
  },
  {
    icon: HeartPulse,
    title: "Personalized Treatment",
    description: "Treat them with our personalized plans tailored to you",
  },
  {
    icon: BookOpen,
    title: "Learn & Prevent",
    description: "Learn about your migraines and how to prevent them",
  },
];

export default function Benefits() {
  return (
    <section id="features" className="bg-[#f8f9fa] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-16 text-center">
          Mygraine AI helps you
        </h2>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Benefits list */}
          <div className="space-y-10">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-500 text-sm">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right - Mygraine Protocol screenshot */}
          <div className="flex justify-center">
            <div className="relative w-72 md:w-80">
              <div className="rounded-[2.5rem] border-[8px] border-gray-900 bg-gray-900 shadow-2xl shadow-gray-300/50 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <img
                  src="/screenshots/mygraine-protocol.png"
                  alt="Mygraine AI protocol screen"
                  className="w-full h-auto rounded-[2rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

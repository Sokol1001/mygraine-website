"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Neurologist",
    quote:
      "The ICHD-3 screening is remarkably accurate. I recommend it to all my patients for pre-visit assessment.",
    stars: 5,
    initials: "SC",
    color: "bg-blue-500",
  },
  {
    name: "Michael R.",
    role: "Migraine Patient",
    quote:
      "Finally an app that actually understands my migraines. The AI consultation felt like talking to a real doctor.",
    stars: 5,
    initials: "MR",
    color: "bg-emerald-500",
  },
  {
    name: "Dr. James Wilson",
    role: "Headache Specialist",
    quote:
      "The diagnostic reports are comprehensive and clinically relevant. A game-changer for telemedicine.",
    stars: 5,
    initials: "JW",
    color: "bg-violet-500",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-14">
          What Our Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < t.stars
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-600 italic leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center`}
                >
                  <span className="text-white text-sm font-semibold">
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

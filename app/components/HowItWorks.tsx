"use client";

import Reveal from "./Reveal";

const steps = [
  {
    numeral: "1",
    title: "Tell us about your migraines",
    description:
      "Have a real conversation with our AI neurologist — no forms, no jargon, just talk.",
  },
  {
    numeral: "2",
    title: "Get your diagnosis & plan",
    description:
      "An ICHD-3 compliant assessment and a treatment protocol personalized to you.",
  },
  {
    numeral: "3",
    title: "Track, predict, prevent",
    description:
      "Log your days, watch your patterns emerge, and get warned before an attack hits.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-paper border-t border-line">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="mb-16 max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-ink/50 mb-5">
            <span className="text-violet" aria-hidden="true">&#10042;</span>
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl leading-[1.08] text-ink tracking-tight">
            From first chat{" "}
            <em className="text-violet font-normal">to fewer migraines.</em>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step, i) => (
            <Reveal key={step.numeral} delay={i * 130}>
              <div className="border-t-2 border-ink pt-7 h-full">
                <p
                  className="text-5xl md:text-6xl italic text-violet mb-5"
                  style={{ fontFamily: "var(--font-family-display)" }}
                >
                  {step.numeral}
                </p>
                <h3 className="text-xl md:text-2xl text-ink mb-3">{step.title}</h3>
                <p className="text-[15px] text-ink/55 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

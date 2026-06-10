"use client";

import Reveal from "./Reveal";

const reasons = [
  {
    title: "Diagnosis, not just data",
    description:
      "Most trackers hand you charts and wish you luck. Mygraine AI runs an ICHD-3 compliant assessment through a natural voice conversation — the same criteria a neurologist would use.",
  },
  {
    title: "Built with the people who treat this",
    description:
      "Developed in collaboration with neurologists and migraine researchers at leading medical centers. Every protocol has a clinician behind it.",
  },
  {
    title: "It learns to see attacks coming",
    description:
      "The AI studies your own history — sleep, stress, weather, cycles — and warns you inside your personal risk window, while there's still time to act.",
  },
];

export default function WhyMyGraine() {
  return (
    <section id="about" className="py-24 md:py-32 bg-lilac">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-24 items-start">
        {/* Left - sticky heading */}
        <Reveal className="lg:sticky lg:top-32">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-ink/50 mb-5">
            <span className="text-violet" aria-hidden="true">&#10042;</span>
            Why Mygraine AI
          </p>
          <h2 className="text-3xl md:text-5xl leading-[1.08] text-ink tracking-tight">
            Built like a clinic,{" "}
            <em className="text-violet font-normal">not another tracker.</em>
          </h2>
          <a
            href="#waitlist"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-9 inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-paper rounded-full text-base font-medium hover:bg-violet transition-colors"
          >
            Join the waitlist
            <span aria-hidden="true">&rarr;</span>
          </a>
        </Reveal>

        {/* Right - reasons with hairline dividers */}
        <div>
          {reasons.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 120}>
              <div className="border-t border-ink/15 py-9 first:border-t-0 first:pt-0">
                <h3 className="text-2xl text-ink mb-3">{reason.title}</h3>
                <p className="text-[15px] text-ink/60 leading-relaxed max-w-lg">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Reveal from "./Reveal";

export default function BigStatement() {
  return (
    <section className="py-24 md:py-36 bg-paper border-t border-line">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <p className="text-2xl md:text-[2.6rem] leading-snug text-ink"
             style={{ fontFamily: "var(--font-family-display)" }}>
            Over a billion people live with migraine. Most are still managing
            it with guesswork —{" "}
            <em className="text-violet">
              years between the first attack and a proper diagnosis.
            </em>
          </p>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-8 text-base text-ink/55 max-w-md leading-relaxed">
            We think getting real answers should take an afternoon, not a
            decade. That&apos;s what we&apos;re building.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

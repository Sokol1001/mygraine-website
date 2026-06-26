"use client";

import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n";

export default function FeatureShowcase() {
  const { t } = useLanguage();
  const cards = t.features.cards;

  return (
    <section
      id="features"
      className="py-24 md:py-32 bg-mist border-t border-line overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <Reveal className="max-w-3xl mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-violet mb-4">
            {t.features.eyebrow}
          </p>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] tracking-tight text-ink">
            {t.features.heading}
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <Reveal key={i} delay={(i % 3) * 100}>
              <article className="group h-full flex flex-col rounded-3xl bg-paper border border-line overflow-hidden hover:shadow-xl hover:shadow-ink/5 hover:-translate-y-1 transition-all duration-300">
                <div className="relative bg-lilac px-8 pt-8 flex justify-center overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.alt}
                    className="w-36 md:w-40 h-auto rounded-t-2xl border-[6px] border-ink border-b-0 shadow-lg shadow-ink/10 translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
                  />
                </div>
                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="font-display font-semibold text-xl text-ink mb-2">
                    {card.title}
                  </h3>
                  <p className="text-base text-ink-soft leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

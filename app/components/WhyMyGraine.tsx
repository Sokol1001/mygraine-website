"use client";

import Reveal from "./Reveal";

const reasons = [
  {
    title: "הכי קרוב לרופא אמיתי",
    description:
      "האבחון נעשה באופן טבעי בשיחה עם אוואטר דמוי רופא, ומבוסס על איבחון קליני של נוירולוג אמיתי.",
  },
  {
    title: "פותח בשיתוף מומחים למיגרנה",
    description:
      "התכנים של האפליקציה מבוססים על ידע וניסיון מקצועי של נוירולוגים וחוקרים מומחים בתחום המיגרנה.",
  },
  {
    title: "שיפור מורגש",
    description:
      "לאחר שהאפליקציה לומדת אותך, היא יודעת לצפות את התקפי המיגרנה שלך מראש, מנחה אותך בהתאם, ובכך מסייעת לך להימנע מהם או להפחית משמעותית את עוצמת ההתקפים.",
  },
];

export default function WhyMyGraine() {
  return (
    <section id="about" className="py-24 md:py-32 bg-lilac">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-24 items-start">
        {/* Sticky heading + CTA */}
        <Reveal className="lg:sticky lg:top-32">
          <h2 className="text-3xl md:text-5xl leading-[1.15] text-ink tracking-tight">
            למה דווקא{" "}
            <span className="text-violet" dir="ltr">Mygraine AI</span>?
          </h2>
          <a
            href="#waitlist"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-9 inline-block px-7 py-3.5 bg-ink text-paper rounded-full text-base font-medium hover:bg-violet transition-colors"
          >
            אני רוצה את האפליקציה
          </a>
        </Reveal>

        {/* Reasons */}
        <div>
          {reasons.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 120}>
              <div className="border-t border-ink/15 py-9 first:border-t-0 first:pt-0">
                <h3 className="text-2xl text-ink mb-3">{reason.title}</h3>
                <p className="text-base text-ink/60 leading-relaxed max-w-lg">
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

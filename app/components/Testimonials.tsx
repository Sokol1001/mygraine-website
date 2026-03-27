import { Star, User } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    title: "Chronic Migraine Patient",
    quote:
      "I waited 3 years for a neurologist appointment. MyGraine gave me an ICHD-3 assessment in 10 minutes and helped me understand my triggers for the first time.",
    stars: 5,
  },
  {
    name: "Dr. James K.",
    title: "Primary Care Physician",
    quote:
      "The screening engine is remarkably thorough. The SNNOOP10 screening catches red flags I want my patients checked for before they even walk into my office.",
    stars: 5,
  },
  {
    name: "Maria L.",
    title: "Migraine with Aura",
    quote:
      "The voice tracking feature changed everything. Instead of forgetting to log attacks, I just talk to the app and it captures every detail.",
    stars: 5,
  },
  {
    name: "Alex T.",
    title: "Episodic Migraine",
    quote:
      "The resilience score motivates me to stick with prevention. Seeing my score go from 42 to 78 in three months was incredibly rewarding.",
    stars: 5,
  },
  {
    name: "Dr. Priya N.",
    title: "Neurologist",
    quote:
      "Finally, a patient-facing tool that actually follows ICHD-3 criteria. My patients come in better informed, which makes consultations far more productive.",
    stars: 5,
  },
  {
    name: "Tom R.",
    title: "Medication Overuse Patient",
    quote:
      "I didn't even know medication overuse headache was a thing until MyGraine flagged it. That single insight changed my treatment completely.",
    stars: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Trusted by patients and clinicians
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 border border-border"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.stars
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-text-primary leading-relaxed text-sm">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-text-primary">
                    {t.name}
                  </p>
                  <p className="text-xs text-text-secondary">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with core features.",
    cta: "Download Free",
    highlighted: false,
    features: [
      "ICHD-3 screening interview",
      "SNNOOP10 red flag screening",
      "Single assessment report",
      "Education hub access",
      "Basic migraine tracking",
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "Full access to tracking, protocols, and AI consultations.",
    cta: "Start Free Trial",
    highlighted: true,
    features: [
      "Everything in Free",
      "Unlimited AI consultations",
      "Voice-driven migraine logging",
      "Trigger analysis dashboard",
      "Resilience score & daily protocol",
      "PHQ-9, GAD-7, ISI screenings",
      "Attack mode protocols",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Choose the plan that fits your needs
          </h2>
          <p className="mt-4 text-text-secondary">
            Start free. Upgrade when you&apos;re ready for the full experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 border flex flex-col ${
                tier.highlighted
                  ? "border-primary shadow-xl shadow-primary/10 relative"
                  : "border-border"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="font-heading font-semibold text-xl text-text-primary">
                {tier.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-text-primary">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-text-secondary">{tier.period}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                {tier.description}
              </p>

              <a
                href="#"
                className={`mt-6 block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  tier.highlighted
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "border border-border text-text-primary hover:bg-muted"
                }`}
              >
                {tier.cta}
              </a>

              <ul className="mt-8 space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

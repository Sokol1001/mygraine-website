import { FileText, Clock, Brain, ShieldAlert, Heart } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Assessment in Minutes",
    description:
      "Our AI neurologist conducts a full ICHD-3 interview in a single voice conversation — no waitlists, no referrals.",
  },
  {
    icon: Brain,
    title: "7 Headache Phenotypes",
    description:
      "Migraine with/without aura, chronic migraine, probable migraine, tension-type, medication overuse, and undifferentiated.",
  },
  {
    icon: ShieldAlert,
    title: "Red Flag Detection",
    description:
      "Automatic SNNOOP10 screening catches thunderclap headache, systemic symptoms, neurological deficits, and onset over 50.",
  },
  {
    icon: Heart,
    title: "Comorbidity Screening",
    description:
      "Integrated PHQ-9, GAD-7, and ISI instruments identify depression, anxiety, and insomnia alongside your assessment.",
  },
  {
    icon: FileText,
    title: "Confidence Scoring",
    description:
      "Every assessment includes a confidence level so you and your doctor can make informed decisions together.",
  },
];

export default function DiagnosticReport() {
  return (
    <section id="diagnosis" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Diagnostic Report
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Clinical-grade assessment, delivered instantly
          </h2>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">
            Every consultation produces a structured assessment report covering
            phenotype, risk scores, comorbidities, and a personalized treatment
            protocol.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Benefits list */}
          <div className="space-y-6">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-text-primary">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Report screenshot */}
          <div className="flex justify-center">
            <img
              src="/screenshots/diagnostic-results.png"
              alt="Diagnostic Results Screen"
              className="h-[28rem] w-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

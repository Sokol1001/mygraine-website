import {
  Brain,
  Mic,
  ShieldCheck,
  Activity,
  BarChart3,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "ICHD-3 Screening Engine",
    description:
      "Full migraine classification following international headache standards — migraine with/without aura, chronic, tension-type, and more.",
  },
  {
    icon: Mic,
    title: "Voice-First Consultation",
    description:
      "Talk naturally with an AI neurologist avatar. Speech recognition, real-time streaming, and lifelike text-to-speech responses.",
  },
  {
    icon: ShieldCheck,
    title: "SNNOOP10 Red Flag Screening",
    description:
      "Automatic safety checks for emergency conditions — thunderclap headache, neurological symptoms, and more — before any assessment.",
  },
  {
    icon: Activity,
    title: "MARS+ Stroke Risk Score",
    description:
      "Evidence-based stroke risk assessment factoring in age, aura status, smoking, and other clinical markers.",
  },
  {
    icon: BarChart3,
    title: "Resilience Scoring",
    description:
      "A dynamic 0-100 score combining attack frequency, severity, lifestyle habits, treatment adherence, and comorbidities.",
  },
  {
    icon: BookOpen,
    title: "Clinical Screening Tools",
    description:
      "Validated PHQ-9 (depression), GAD-7 (anxiety), and ISI (insomnia) instruments built right into the app.",
  },
];

export default function PlatformFeatures() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Platform
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            The AI-powered screening engine for migraine care
          </h2>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">
            Clinically grounded intelligence that goes beyond symptom tracking —
            delivering real assessments, risk scores, and personalized
            protocols.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-border hover:border-primary-light/40 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-text-primary">
                {f.title}
              </h3>
              <p className="mt-2 text-text-secondary leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Dashboard screenshot */}
        <div className="mt-16 rounded-2xl overflow-hidden border border-border flex justify-center gap-6 bg-muted p-8">
          <img src="/screenshots/resilience-score.png" alt="Resilience Score" className="h-[28rem] w-auto rounded-2xl shadow-lg" />
          <img src="/screenshots/mygraine-protocol.png" alt="MyGraine Protocol" className="h-[28rem] w-auto rounded-2xl shadow-lg hidden md:block" />
          <img src="/screenshots/education-hub.png" alt="Education Hub" className="h-[28rem] w-auto rounded-2xl shadow-lg hidden lg:block" />
        </div>
      </div>
    </section>
  );
}

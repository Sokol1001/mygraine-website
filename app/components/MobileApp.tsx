import {
  Smartphone,
  TrendingUp,
  Zap,
  Target,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Track Every Attack",
    description:
      "Log migraines with voice — onset, intensity, location, triggers, medications, and duration captured conversationally.",
  },
  {
    icon: TrendingUp,
    title: "Trigger Analysis",
    description:
      "See which triggers correlate most with your attacks through frequency charts and percentage-based insights.",
  },
  {
    icon: Zap,
    title: "Daily Protocol",
    description:
      "Personalized prevention tasks — sleep, hydration, exercise, and neuromodulation tracking — all in one place.",
  },
  {
    icon: Target,
    title: "Resilience Dashboard",
    description:
      "A dynamic ring score (0-100) showing your migraine resilience, broken down by six contributing factors.",
  },
  {
    icon: GraduationCap,
    title: "Education Hub",
    description:
      "Learn about CGRP, cervical spine factors, treatment options, and take validated clinical self-assessments.",
  },
];

export default function MobileApp() {
  return (
    <section id="app" className="py-20 md:py-28 bg-muted">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Left – Phone screenshot */}
        <div className="flex justify-center">
          <div className="relative w-72 md:w-80 rounded-[2.5rem] shadow-xl overflow-hidden">
            <img
              src="/screenshots/clinical-intake.png"
              alt="Begin Clinical Intake"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Right – Features */}
        <div>
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Mobile App
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Your migraine companion, always in your pocket
          </h2>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">
            Track, understand, and manage your migraines with tools designed
            around how you actually live.
          </p>

          <div className="mt-10 space-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-text-primary">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

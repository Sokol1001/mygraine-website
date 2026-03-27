import { Zap, BookOpenCheck, Database, Bell } from "lucide-react";

const capabilities = [
  {
    icon: Zap,
    title: "Natural Voice Interaction",
    description:
      "Speak naturally and receive instant, lifelike voice responses — the conversation flows just like talking to a real specialist.",
  },
  {
    icon: BookOpenCheck,
    title: "Evidence-Based Intelligence",
    description:
      "The LLM's knowledge is built entirely on elite neurologist expertise and ICHD-3 clinical standards, ensuring every response is medically grounded.",
  },
  {
    icon: Database,
    title: "Complete Patient Context",
    description:
      "Your assessment, attack history, trigger patterns, and screening results all inform every conversation.",
  },
  {
    icon: Bell,
    title: "Emotion-Aware Responses",
    description:
      "The AI adapts its tone — concerned when discussing red flags, reassuring during routine consultations, encouraging during progress reviews.",
  },
];

export default function AiCopilot() {
  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            AI Avatar
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Meet your AI neurologist
          </h2>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">
            A lifelike 3D avatar driven by voice and backed by clinical
            intelligence. It listens, assesses, and guides — just like a real
            consultation.
          </p>
        </div>

        {/* Side-by-side: avatar left, capabilities right */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left – Avatar screenshot */}
          <div className="flex justify-center">
            <img
              src="/screenshots/ai-avatar.png"
              alt="AI Avatar Consultation"
              className="w-72 md:w-80 rounded-[2.5rem] shadow-xl"
            />
          </div>

          {/* Right – Capability cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-2xl p-5 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <c.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-text-primary">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

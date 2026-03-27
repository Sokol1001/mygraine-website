import { ArrowRight, ShieldCheck, Stethoscope } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent blur-[100px]" />
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-white blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left – Copy */}
        <div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Your AI neurologist.
            <br />
            <span className="text-accent-light">Always on call.</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-lg leading-relaxed">
            Get an ICHD-3 compliant migraine assessment through a conversational
            AI doctor — powered by voice, guided by science. Track attacks,
            understand your triggers, and build resilience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary rounded-xl text-base font-semibold hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
            >
              Get Early Access
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white rounded-xl text-base font-semibold hover:bg-white/10 transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ICHD-3 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              Evidence-Based AI
            </span>
          </div>
        </div>

        {/* Right – App screenshot */}
        <div className="flex justify-center">
          <div className="relative w-80 md:w-96 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <img
              src="/screenshots/clinical-intake.png"
              alt="Begin Clinical Intake Screen"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

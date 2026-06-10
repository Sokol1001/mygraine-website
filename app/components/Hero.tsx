"use client";

import PhoneFrame from "./PhoneFrame";

export default function Hero() {
  const scrollTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-paper pt-32 md:pt-40 pb-0 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-10 items-end">
        {/* Left - editorial copy */}
        <div className="pb-16 md:pb-24">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-ink/50 mb-7">
            <span className="text-violet" aria-hidden="true">&#10042;</span>
            For people who plan life around their head
          </p>

          <h1 className="text-[2.75rem] md:text-6xl lg:text-[4.25rem] leading-[1.04] text-ink tracking-tight">
            Your migraines follow a{" "}
            <span className="relative inline-block">
              pattern
              <svg
                className="absolute left-0 -bottom-1.5 w-full"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8 Q 26 3, 50 7 T 100 7 T 150 7 T 197 5"
                  fill="none"
                  stroke="#5b5bd6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .{" "}
            <em className="text-violet font-normal">We taught an AI to read it.</em>
          </h1>

          <p className="mt-7 text-lg text-ink/65 max-w-md leading-relaxed">
            Mygraine AI tracks your attacks, learns your triggers, and warns
            you before the next one — with a treatment plan built around your
            life, not a template.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#waitlist"
              onClick={(e) => scrollTo(e, "#waitlist")}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-paper rounded-full text-base font-medium hover:bg-violet transition-colors"
            >
              Join the waitlist
              <span aria-hidden="true">&rarr;</span>
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollTo(e, "#how-it-works")}
              className="text-base text-ink/70 hover:text-ink underline underline-offset-4 decoration-violet/60 transition-colors"
            >
              See how it works
            </a>
          </div>

          <p className="mt-10 text-sm text-ink/45">
            ICHD-3 compliant assessment&ensp;&middot;&ensp;Built with neurologists
          </p>
        </div>

        {/* Right - phone in an arch */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Arch backdrop */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-auto lg:right-2 lg:translate-x-0 w-[19rem] md:w-[21rem] h-[88%] bg-lilac rounded-t-full"
            aria-hidden="true"
          />

          <div className="relative w-60 md:w-64 mt-10 lg:mr-12 rotate-2">
            <PhoneFrame
              src="/screenshots/clinical-intake.png"
              alt="Mygraine AI clinical intake screen"
            />
          </div>

          {/* Annotation note */}
          <div className="absolute bottom-14 left-2 md:left-6 lg:-left-6 -rotate-3 bg-white border border-ink/10 rounded-xl px-4 py-3 max-w-[13rem] shadow-[5px_5px_0_#eceaf8]">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <span className="relative flex w-2 h-2" aria-hidden="true">
                <span className="absolute inline-flex w-full h-full rounded-full bg-violet opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-violet" />
              </span>
              Pattern detected
            </p>
            <p className="text-xs text-ink/55 mt-1 leading-snug">
              Your usual three-day window starts tomorrow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import PhoneFrame from "./PhoneFrame";

export default function Hero() {
  const scrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-paper pt-32 md:pt-40 pb-0 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-10 items-end">
        {/* Copy */}
        <div className="pb-16 md:pb-24">
          <h1 className="text-[2.6rem] md:text-6xl lg:text-[4rem] leading-[1.1] text-ink tracking-tight">
            נוירולוג מומחה למיגרנה{" "}
            <span className="relative inline-block text-violet">
              אצלך בכיס!
              <svg
                className="absolute right-0 -bottom-1.5 w-full"
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
          </h1>

          <p className="mt-7 text-lg text-ink/65 max-w-lg leading-relaxed">
            תוכנית טיפול עצמי למיגרנה שפותחה על ידי נוירולוג מומחה ומתאמת
            עבורך אישית באמצעות בינה מלאכותית. הכי נוח, הכי חכם, הכי יעיל.
          </p>

          <div className="mt-9">
            <a
              href="#waitlist"
              onClick={scrollToWaitlist}
              className="inline-block px-8 py-4 bg-ink text-paper rounded-full text-base font-medium hover:bg-violet transition-colors"
            >
              אני רוצה את האפליקציה
            </a>
          </div>
        </div>

        {/* Phone in an arch */}
        <div className="relative flex justify-center">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[19rem] md:w-[21rem] h-[88%] bg-lilac rounded-t-full"
            aria-hidden="true"
          />
          <div className="relative w-60 md:w-64 mt-10 rotate-2">
            <PhoneFrame
              src="/screenshots/clinical-intake.png"
              alt="מסך האפליקציה Mygraine AI"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink text-paper border-t border-paper/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8">
          <a href="#">
            <img
              src="/logos/mygraine-AI-logo-new.png"
              alt="Mygraine AI"
              className="h-12 w-auto"
            />
          </a>
          <p className="text-paper/40 text-sm" dir="ltr">
            &copy; 2026 Mygraine AI
          </p>
        </div>

        {/* Giant wordmark */}
        <div className="select-none pointer-events-none -mb-6 md:-mb-10" aria-hidden="true">
          <p
            className="text-center text-[19vw] leading-[0.85] tracking-tight text-paper/[0.06] whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-display)" }}
            dir="ltr"
          >
            Mygraine
          </p>
        </div>
      </div>
    </footer>
  );
}

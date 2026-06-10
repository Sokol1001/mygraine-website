const footerLinks = {
  Product: [
    { label: "Inside the app", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Why us", href: "#about" },
    { label: "Join the waitlist", href: "#waitlist" },
  ],
  Resources: [
    { label: "Help Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ink text-paper border-t border-paper/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-block mb-4">
              <img
                src="/logos/mygraine-AI-logo-new.png"
                alt="Mygraine AI"
                className="h-14 w-auto"
              />
            </a>
            <p className="text-paper/50 leading-relaxed max-w-xs text-sm">
              AI-powered migraine tracking, treatment, and predictions.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs uppercase tracking-[0.22em] text-paper/40 mb-5 font-sans font-medium"
                  style={{ fontFamily: "var(--font-family-body)" }}>
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-paper/60 hover:text-paper text-sm underline-offset-4 hover:underline transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-paper/10 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-paper/40 text-sm">
            &copy; 2026 Mygraine AI. All rights reserved.
          </p>
          <p className="text-paper/30 text-xs">
            Not a substitute for professional medical advice.
          </p>
        </div>

        {/* Giant wordmark */}
        <div className="select-none pointer-events-none -mb-6 md:-mb-10" aria-hidden="true">
          <p
            className="text-center text-[19vw] leading-[0.85] tracking-tight text-paper/[0.06] whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-display)" }}
          >
            Mygraine
          </p>
        </div>
      </div>
    </footer>
  );
}

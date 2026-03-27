import { Brain } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Mobile App", href: "#app" },
    { label: "Diagnosis", href: "#diagnosis" },
    { label: "Pricing", href: "#pricing" },
  ],
  Resources: [
    { label: "FAQ", href: "#faq" },
    { label: "ICHD-3 Guidelines", href: "#" },
    { label: "Research", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-semibold text-lg">
                mygraine<span className="text-accent-light"> ai</span>
              </span>
            </a>
            <p className="text-white/60 leading-relaxed max-w-sm text-sm">
              AI-powered migraine screening and management. Get an ICHD-3
              compliant assessment, track your attacks, and build resilience —
              all from your phone.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} MyGraine AI. All rights reserved.
          </p>
          <p className="text-white/30 text-xs max-w-lg text-center md:text-right">
            MyGraine AI is not a medical device and does not provide medical
            advice. Always consult a qualified healthcare professional for
            diagnosis and treatment.
          </p>
        </div>
      </div>
    </footer>
  );
}

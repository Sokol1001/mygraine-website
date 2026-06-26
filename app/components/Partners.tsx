"use client";

import { useLanguage } from "@/lib/i18n";

const partners = [
  { name: "Melikov Center", logo: "/logos/melikov-center.png", heightClass: "h-10" },
  { name: "Artificial Gate", logo: "/logos/artificial-gate.png", heightClass: "h-10" },
  { name: "Up-Rise Reichman Accelerator", logo: "/logos/uprise-reichman.jpg", heightClass: "h-10" },
  { name: "Teva Pharmaceuticals", logo: "/logos/teva.png", heightClass: "h-7" },
];

export default function Partners() {
  const { t } = useLanguage();
  return (
    <section className="py-14 bg-paper border-y border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-ink/40 mb-8">
          {t.partners.eyebrow}
        </p>
        <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
          {partners.map((partner) => (
            <img
              key={partner.name}
              src={partner.logo}
              alt={partner.name}
              className={`${partner.heightClass} w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

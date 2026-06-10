"use client";

const partners = [
  { name: "Melikov Center", logo: "/logos/melikov-center.png", heightClass: "h-12" },
  { name: "Artificial Gate", logo: "/logos/artificial-gate.png", heightClass: "h-12" },
  { name: "Up-Rise Reichman Accelerator", logo: "/logos/uprise-reichman.jpg", heightClass: "h-12" },
  { name: "Teva Pharmaceuticals", logo: "/logos/teva.png", heightClass: "h-9" },
];

export default function Partners() {
  // Duplicate the list so the marquee loops seamlessly
  const loop = [...partners, ...partners, ...partners];

  return (
    <section className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-[0.25em] mb-9">
          Backed by
        </p>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="flex items-center gap-20 w-max animate-marquee">
            {loop.map((partner, i) => (
              <img
                key={`${partner.name}-${i}`}
                src={partner.logo}
                alt={partner.name}
                className={`${partner.heightClass} w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 shrink-0`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

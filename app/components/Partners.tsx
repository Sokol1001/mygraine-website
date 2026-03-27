"use client";

const partners = [
  { name: "Melikov Center", logo: "/logos/melikov-center.png" },
  { name: "Artificial Gate", logo: "/logos/artificial-gate.png" },
  { name: "Up-Rise Reichman Accelerator", logo: "/logos/uprise-reichman.jpg" },
];

export default function Partners() {
  const doubled = [...partners, ...partners];

  return (
    <section className="py-14 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-semibold text-text-secondary uppercase tracking-wider mb-8">
          Our Partners
        </p>
        <div
          className="overflow-hidden"
          style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
        >
          <div className="flex items-center gap-14 w-max animate-marquee">
            {doubled.map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="flex items-center justify-center shrink-0 px-6"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-16 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

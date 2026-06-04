"use client";

const partners = [
  { name: "Melikov Center", logo: "/logos/melikov-center.png", heightClass: "h-14" },
  { name: "Artificial Gate", logo: "/logos/artificial-gate.png", heightClass: "h-14" },
  { name: "Up-Rise Reichman Accelerator", logo: "/logos/uprise-reichman.jpg", heightClass: "h-14" },
  { name: "Teva Pharmaceuticals", logo: "/logos/teva.png", heightClass: "h-10" },
];

export default function Partners() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-10">
          Backed By
        </p>
        <div className="flex items-center justify-center gap-16 flex-wrap">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={`${partner.heightClass} w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

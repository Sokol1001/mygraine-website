const partners = [
  { name: "Melikov Center", logo: "/logos/melikov-center.png", heightClass: "h-11" },
  { name: "Artificial Gate", logo: "/logos/artificial-gate.png", heightClass: "h-11" },
  { name: "Up-Rise Reichman Accelerator", logo: "/logos/uprise-reichman.jpg", heightClass: "h-11" },
  { name: "Teva Pharmaceuticals", logo: "/logos/teva.png", heightClass: "h-8" },
];

export default function Partners() {
  return (
    <section className="py-12 bg-paper border-t border-line">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-12 md:gap-16 flex-wrap">
        {partners.map((partner) => (
          <img
            key={partner.name}
            src={partner.logo}
            alt={partner.name}
            className={`${partner.heightClass} w-auto object-contain grayscale opacity-55 hover:grayscale-0 hover:opacity-100 transition-all duration-300`}
          />
        ))}
      </div>
    </section>
  );
}

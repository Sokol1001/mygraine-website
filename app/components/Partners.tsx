const partners = [
  { name: "Melikov Center", logo: "/logos/melikov-center.png", heightClass: "h-10" },
  { name: "Artificial Gate", logo: "/logos/artificial-gate.png", heightClass: "h-10" },
  { name: "Up-Rise Reichman Accelerator", logo: "/logos/uprise-reichman.jpg", heightClass: "h-10" },
  { name: "Teva Pharmaceuticals", logo: "/logos/teva.png", heightClass: "h-7" },
];

export default function Partners() {
  // Repeat so the strip is wide enough, then render two identical copies for a
  // seamless -50% marquee loop.
  const reel = [...partners, ...partners, ...partners];

  return (
    <section className="py-12 bg-paper border-y border-line overflow-hidden">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {reel.map((partner, i) => (
              <img
                key={`${copy}-${i}`}
                src={partner.logo}
                alt={partner.name}
                className={`${partner.heightClass} w-auto object-contain mx-10 md:mx-14 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300`}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

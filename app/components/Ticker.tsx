const phrases = [
  "Track honestly",
  "Predict early",
  "Treat smarter",
  "Recover faster",
  "Understand fully",
  "Live bigger",
];

export default function Ticker() {
  // Two identical halves so the -50% marquee loops seamlessly
  const half = [...phrases, ...phrases];

  return (
    <div className="border-y border-line bg-paper overflow-hidden py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {half.map((phrase, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center text-xl md:text-2xl text-ink/80 whitespace-nowrap"
              >
                <em className="font-display italic" style={{ fontFamily: "var(--font-family-display)" }}>
                  {phrase}
                </em>
                <span className="mx-6 text-violet text-base">&#10042;</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

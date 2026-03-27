"use client";

import { Apple, Play } from "lucide-react";

export default function DownloadCTA() {
  return (
    <section
      className="py-20 md:py-28"
      style={{
        background: "linear-gradient(to right, #6267c8, #2a9ee9)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Take Control of Your Migraines Today
        </h2>
        <p className="text-lg text-white/80 mb-10">
          Join thousands of users managing their migraines smarter with AI
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#6267c8] transition-colors duration-200"
          >
            <Apple className="w-5 h-5" />
            <span className="font-semibold text-sm">Download on App Store</span>
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#2a9ee9] transition-colors duration-200"
          >
            <Play className="w-5 h-5" />
            <span className="font-semibold text-sm">Get on Google Play</span>
          </a>
        </div>
      </div>
    </section>
  );
}

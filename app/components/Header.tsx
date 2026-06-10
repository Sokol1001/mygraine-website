"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToWaitlist = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-paper/90 backdrop-blur-md border-b transition-colors duration-300 ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center">
          <img
            src="/logos/mygraine-AI-logo-new.png"
            alt="Mygraine AI"
            className="h-12 md:h-14 w-auto"
          />
        </a>

        {/* CTA */}
        <a
          href="#waitlist"
          onClick={scrollToWaitlist}
          className="px-4 md:px-6 py-2.5 bg-ink text-paper rounded-full text-sm md:text-base font-medium hover:bg-violet transition-colors"
        >
          אני רוצה את האפליקציה
        </a>
      </div>
    </header>
  );
}

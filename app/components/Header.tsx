"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-paper/85 backdrop-blur-md border-b border-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-18 flex items-center justify-between gap-4">
        <a href="#" onClick={jump("#top")} className="flex items-center shrink-0">
          <img
            src="/logos/mygraine-AI-logo-new.png"
            alt="Mygraine AI"
            className="h-11 md:h-12 w-auto"
          />
        </a>

        <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-ink/70">
          <a href="#features" onClick={jump("#features")} className="hover:text-ink transition-colors">
            {t.nav.features}
          </a>
          <a href="#about" onClick={jump("#about")} className="hover:text-ink transition-colors">
            {t.nav.why}
          </a>
        </nav>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <LanguageToggle />
          <a
            href="#waitlist"
            onClick={jump("#waitlist")}
            className="px-5 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-violet transition-colors"
          >
            {t.common.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

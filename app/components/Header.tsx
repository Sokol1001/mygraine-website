"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Inside the app", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why us", href: "#about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
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
            className="h-14 w-auto"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm text-ink/70 hover:text-ink underline-offset-4 decoration-violet/60 hover:underline transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <a
            href="#waitlist"
            onClick={(e) => handleNavClick(e, "#waitlist")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-violet transition-colors"
          >
            Join the waitlist
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ink"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-paper border-t border-line px-6 py-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 text-ink/70 hover:text-ink text-sm"
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#waitlist"
            className="mt-3 block text-center px-5 py-3 bg-ink text-paper rounded-full text-sm font-medium"
            onClick={(e) => handleNavClick(e, "#waitlist")}
          >
            Join the waitlist &rarr;
          </a>
        </div>
      )}
    </header>
  );
}

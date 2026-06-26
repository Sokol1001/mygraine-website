"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const { lang, toggle } = useLanguage();
  // Show the language you can switch TO.
  const label = lang === "en" ? "עברית" : "English";
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-lilac transition-colors ${className}`}
    >
      <Globe className="w-4 h-4" />
      {label}
    </button>
  );
}

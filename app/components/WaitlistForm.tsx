"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n";

export default function WaitlistForm() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("https://formsubmit.co/ajax/markmelicov@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          _subject: "New Mygraine AI Waitlist Signup",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="waitlist" className="py-24 md:py-36 bg-mist border-t border-line">
      <div className="max-w-2xl mx-auto px-5 md:px-8 text-center">
        <Reveal>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.04] tracking-tight text-ink mb-5">
            {t.waitlist.headingPrefix}
            <span className="text-violet">{t.waitlist.headingHighlight}</span>
            {t.waitlist.headingSuffix}
          </h2>
          <p className="text-lg text-ink-soft mb-12 max-w-lg mx-auto">
            {t.waitlist.subtitle}
          </p>
        </Reveal>

        <Reveal delay={120}>
          {status === "success" ? (
            <div className="rounded-3xl border border-line bg-paper p-10">
              <CheckCircle className="w-10 h-10 mx-auto mb-4 text-violet" />
              <h3 className="font-display font-semibold text-2xl mb-2 text-ink">
                {t.waitlist.successTitle}
              </h3>
              <p className="text-ink-soft">{t.waitlist.successBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3.5 text-start">
              <label className="block">
                <span className="block text-sm text-ink/60 mb-1.5 ps-2">{t.waitlist.nameLabel}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-6 py-4 rounded-full bg-paper border border-line text-ink focus:outline-none focus:ring-2 focus:ring-violet text-base"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-ink/60 mb-1.5 ps-2">{t.waitlist.emailLabel}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-6 py-4 rounded-full bg-paper border border-line text-ink focus:outline-none focus:ring-2 focus:ring-violet text-base"
                />
              </label>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-ink text-paper font-medium rounded-full hover:bg-violet transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-base"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t.waitlist.submit
                )}
              </button>
              {status === "error" && (
                <p className="text-red-500 text-sm text-center">
                  {t.waitlist.error}
                </p>
              )}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

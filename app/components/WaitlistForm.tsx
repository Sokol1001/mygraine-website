"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import Reveal from "./Reveal";

export default function WaitlistForm() {
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
    <section id="waitlist" className="py-24 md:py-36 bg-ink text-paper">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <Reveal>
          <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-paper/50 mb-6">
            <span className="text-violet" aria-hidden="true">&#10042;</span>
            Early access
          </p>
          <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-tight mb-5">
            Be first in line{" "}
            <em className="font-normal" style={{ color: "#9d9df0" }}>
              when we launch.
            </em>
          </h2>
          <p className="text-lg text-paper/60 mb-12 max-w-md mx-auto">
            Join the waiting list and we&apos;ll save you a spot — no spam,
            just the launch.
          </p>
        </Reveal>

        <Reveal delay={120}>
          {status === "success" ? (
            <div className="border border-paper/15 rounded-3xl p-10">
              <CheckCircle className="w-10 h-10 mx-auto mb-4 text-violet" style={{ color: "#9d9df0" }} />
              <h3 className="text-2xl mb-2">You&apos;re on the list.</h3>
              <p className="text-paper/60">
                We&apos;ll write to you the moment Mygraine AI is ready.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3.5 text-left">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-full bg-paper text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-violet text-sm"
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-full bg-paper text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-violet text-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-violet text-white font-medium rounded-full hover:bg-paper hover:text-ink transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving your spot...
                  </>
                ) : (
                  <>Join the waitlist &rarr;</>
                )}
              </button>
              {status === "error" && (
                <p className="text-red-300 text-sm text-center">
                  Something went wrong. Please try again.
                </p>
              )}
              <p className="text-paper/35 text-xs text-center pt-2">
                We&apos;ll only use your email to tell you when we launch.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

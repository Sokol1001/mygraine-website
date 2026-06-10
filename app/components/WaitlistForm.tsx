"use client";

import { useState } from "react";
import { Mail, User, CheckCircle, Loader2, Lock } from "lucide-react";
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
    <section id="waitlist" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="relative rounded-[2.5rem] bg-[#11122e] overflow-hidden px-6 py-16 md:px-16 md:py-20">
            {/* Aurora glow inside the panel */}
            <div
              className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#6267c8]/40 blur-3xl animate-pulse-glow"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#2a9ee9]/30 blur-3xl animate-pulse-glow [animation-delay:2s]"
              aria-hidden="true"
            />

            <div className="relative max-w-xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Get early access
              </h2>
              <p className="text-lg text-white/70 mb-10">
                Join the waiting list and be the first to try Mygraine AI
              </p>

              {status === "success" ? (
                <div className="bg-white/10 backdrop-blur border border-white/15 rounded-3xl p-10 text-white">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-brand flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">You&apos;re on the list!</h3>
                  <p className="text-white/70">
                    We&apos;ll notify you as soon as Mygraine AI is ready.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pr-5 py-4 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2a9ee9] text-sm"
                      style={{ paddingLeft: "3.25rem" }}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pr-5 py-4 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2a9ee9] text-sm"
                      style={{ paddingLeft: "3.25rem" }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 bg-gradient-brand text-white font-semibold rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Join the Waiting List"
                    )}
                  </button>
                  {status === "error" && (
                    <p className="text-red-300 text-sm">
                      Something went wrong. Please try again.
                    </p>
                  )}
                  <p className="flex items-center justify-center gap-1.5 text-white/40 text-xs pt-2">
                    <Lock className="w-3.5 h-3.5" />
                    We&apos;ll only use your email to tell you when we launch.
                  </p>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

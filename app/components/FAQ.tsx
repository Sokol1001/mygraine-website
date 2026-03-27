"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Is MyGraine AI a replacement for seeing a doctor?",
    a: "No. MyGraine AI provides an ICHD-3 compliant screening and educational tool to help you understand your headaches. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.",
  },
  {
    q: "How does the screening interview work?",
    a: "You speak naturally with our AI neurologist avatar. It asks clinically structured questions following ICHD-3 criteria — covering headache characteristics, duration, frequency, aura symptoms, and associated features. The conversation typically takes 5-10 minutes and produces a detailed assessment report.",
  },
  {
    q: "What headache types can it identify?",
    a: "The engine classifies 7 phenotypes: Migraine without Aura, Migraine with Aura, Chronic Migraine, Probable Migraine, Tension-Type Headache, Medication Overuse Headache, and Undifferentiated Headache. It also screens for red flags that require emergency evaluation.",
  },
  {
    q: "Is my health data secure?",
    a: "Yes. All data is stored locally on your device using encrypted storage. Cloud features use Supabase with row-level security. We never sell or share your health data with third parties.",
  },
  {
    q: "What are the PHQ-9, GAD-7, and ISI screenings?",
    a: "These are validated clinical instruments used worldwide. PHQ-9 screens for depression, GAD-7 for generalized anxiety, and ISI for insomnia — all common migraine comorbidities. Understanding these helps paint a complete picture of your health.",
  },
  {
    q: "Do I need special hardware or a powerful phone?",
    a: "MyGraine AI runs on standard modern smartphones. The 3D avatar uses Unity rendering optimized for mobile — no external hardware or GPU servers needed. Works on both iOS and Android.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            FAQ
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-border">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="font-heading font-semibold text-text-primary pr-8">
                  {faq.q}
                </span>
                {openIndex === i ? (
                  <Minus className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-text-secondary shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <p className="pb-5 text-text-secondary leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

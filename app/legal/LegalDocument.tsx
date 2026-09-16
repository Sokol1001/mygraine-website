"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Shared chrome for the hosted legal documents.
 *
 * These pages exist so that publishing the Terms and Privacy Policy is a paste
 * rather than a build. Three separate things are blocked until they are live at
 * a stable URL:
 *
 *   - Google OAuth cannot leave "Testing" mode, which caps sign-in at 100 test
 *     users — a wall, not a limitation, for a 200-patient pilot.
 *   - The Play Store Data Safety and Health Apps declarations both require a
 *     privacy policy URL.
 *   - App Store Guideline 5.1.1 requires a reachable privacy policy for any app
 *     handling health data, so no external TestFlight group can be created.
 *
 * The clinic's legal team owns the TEXT. Nothing here should pre-empt it: each
 * page renders a placeholder until the real content is dropped in, and says so
 * plainly rather than showing a patient half a policy.
 */
export function LegalDocument({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper" dir="ltr">
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-lg text-ink">Mygraine AI</span>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {updated && <p className="mt-2 text-sm text-ink/50">Last updated {updated}</p>}
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink/80">{children}</div>
      </article>
    </main>
  );
}

/**
 * Shown until the clinic's legal team delivers the final text. Deliberately
 * explicit: a half-written policy on a health app is worse than an honest
 * "not published yet", and this page must never be linked from the app while
 * it says this (src/config/legal.ts keeps the in-app links hidden until the
 * URLs are filled in, which is the same gate from the other side).
 */
export function AwaitingLegalText({ documentName }: { documentName: string }) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
      <p className="font-medium">This {documentName} has not been published yet.</p>
      <p className="mt-2 text-sm">
        It is being prepared by the clinic&apos;s legal team. Until it is published, the app does
        not link here and does not present it to patients for agreement.
      </p>
      <p className="mt-2 text-sm">
        If you need a copy before then, contact the clinic directly.
      </p>
    </div>
  );
}

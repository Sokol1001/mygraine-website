import { LegalDocument, AwaitingLegalText } from "../LegalDocument";

export const metadata = {
  title: "Terms of Service — Mygraine AI",
  description: "The terms under which Mygraine AI is provided.",
};

/**
 * Replace <AwaitingLegalText/> with the legal team's text when it arrives, set
 * `updated`, then fill TERMS_URL in the app's src/config/legal.ts with
 *   https://www.mygraine.ai/legal/terms
 * and bump CONSENT_VERSION alongside the privacy policy.
 */
export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service">
      <AwaitingLegalText documentName="terms of service" />
    </LegalDocument>
  );
}

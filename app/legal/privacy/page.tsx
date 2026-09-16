import { LegalDocument, AwaitingLegalText } from "../LegalDocument";

export const metadata = {
  title: "Privacy Policy — Mygraine AI",
  description: "How Mygraine AI handles patient health data.",
};

/**
 * Replace <AwaitingLegalText/> with the legal team's text when it arrives, set
 * `updated`, then fill PRIVACY_URL in the app's src/config/legal.ts with
 *   https://www.mygraine.ai/legal/privacy
 * and bump CONSENT_VERSION so consents against the draft stay distinguishable
 * from consents to the final text.
 */
export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy">
      <AwaitingLegalText documentName="privacy policy" />
    </LegalDocument>
  );
}

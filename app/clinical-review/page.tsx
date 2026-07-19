import { Suspense } from "react";
import ClinicalReviewClient from "./ClinicalReviewClient";

// Hidden clinical-content review tool (not linked anywhere; noindexed via
// vercel.json). Static export → all logic runs client-side; the reviewer signs
// in with a passwordless magic link and their answers persist to Supabase.
export const metadata = {
  title: "Clinical Content Review",
  robots: { index: false, follow: false },
};

export default function ClinicalReviewPage() {
  return (
    <Suspense fallback={null}>
      <ClinicalReviewClient />
    </Suspense>
  );
}

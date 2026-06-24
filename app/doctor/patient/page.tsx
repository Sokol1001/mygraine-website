import { Suspense } from "react";
import PatientDetailClient from "./PatientDetailClient";

// Static export: the patient id is read client-side from ?id=<uuid> via
// useSearchParams, which must be wrapped in a Suspense boundary. This single
// static page serves every patient — hard-load, refresh, and bookmark all work.
export default function PatientDetailPage() {
  return (
    <Suspense fallback={null}>
      <PatientDetailClient />
    </Suspense>
  );
}

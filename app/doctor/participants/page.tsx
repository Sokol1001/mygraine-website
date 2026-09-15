import { Suspense } from "react";
import ParticipantsClient from "./ParticipantsClient";

// Static export, same shape as /doctor/patient: the client component owns the
// session check and every RPC call.
export default function ParticipantsPage() {
  return (
    <Suspense fallback={null}>
      <ParticipantsClient />
    </Suspense>
  );
}

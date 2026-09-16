// Shapes returned by the Supabase RPCs (doctor_patient_summaries / doctor_patient_detail).
// All fields may be null.

export type ResilienceZone = "strong" | "moderate" | "at_risk" | "high_risk";

// Enrollment cohort (migration 034). Only clinic_patient and friend_family
// reach the clinic roster and the ML exports; internal_tester and unknown are
// visible on /doctor/participants only, so staff can promote real patients.
export type Cohort = "clinic_patient" | "friend_family" | "internal_tester" | "unknown";

export const COHORTS: Cohort[] = ["clinic_patient", "friend_family", "internal_tester", "unknown"];

export const COHORT_LABEL: Record<Cohort, string> = {
  clinic_patient: "Clinic",
  friend_family: "Friends & family",
  internal_tester: "Internal",
  unknown: "Unassigned",
};

export const COHORT_CLASS: Record<Cohort, string> = {
  clinic_patient: "bg-violet/10 text-violet",
  friend_family: "bg-sky-50 text-sky-700",
  internal_tester: "bg-slate-100 text-slate-600",
  unknown: "bg-amber-50 text-amber-700",
};

export function cohortLabel(c: Cohort | null | undefined): string {
  return c ? COHORT_LABEL[c] ?? c : "—";
}

export interface PatientSummary {
  user_id: string;
  email: string | null;
  name: string | null;
  member_since: string | null;
  phenotype: string | null;
  diagnosis_confidence: number | null;
  preventive_drug_class: string | null;
  tracks_menstrual_cycle: boolean | null;
  latest_resilience_score: number | null;
  latest_zone: ResilienceZone | null;
  attacks_30d: number | null;
  latest_phq2: number | null;
  latest_gad2: number | null;
  latest_isi: number | null;
  last_log_date: string | null;
  // appended by 034, rebuilt by 039
  //
  // has_healthkit and conversation_count were REMOVED from patient_summary in
  // migration 039: neither was ever rendered from the roster, and computing
  // them there dragged participant_quality's five correlated sub-queries into
  // every roster load — for every participant, not just the exported ones.
  // has_healthkit still exists on ParticipantRow, which reads
  // staff_list_participants instead.
  cohort: Cohort | null;
  days_enrolled: number | null;
  log_days: number | null;
}

export interface ParticipantInfo {
  cohort: Cohort;
  clinic_ref: string | null;
  enrolled_at: string | null;
  consent_version: string | null;
  consented_at: string | null;
}

// staff_list_participants() — every account, unknowns first.
export interface ParticipantRow {
  user_id: string;
  email: string | null;
  name: string | null;
  cohort: Cohort;
  clinic_ref: string | null;
  enrolled_at: string | null;
  consent_version: string | null;
  member_since: string | null;
  last_log_date: string | null;
  log_days: number | null;
  has_healthkit: boolean | null;
  is_staff: boolean;
  invite_code: string | null;
}

// staff_list_invites()
export type InviteStatus = "active" | "expired" | "exhausted" | "revoked";
export interface InviteRow {
  id: string;
  code: string;
  cohort: Cohort;
  clinic_ref: string | null;
  created_by_email: string | null;
  created_at: string;
  expires_at: string | null;
  max_uses: number;
  used_count: number;
  revoked_at: string | null;
  status: InviteStatus;
  note: string | null;
}

export interface ResilienceTrendPoint {
  date: string;
  score: number | null;
  zone: ResilienceZone | null;
  factor_scores: Record<string, number> | null;
  confidence: number | null;
}

export interface AttackRecord {
  date: string;
  attack_severity: number | null;
  attack_duration_hours: number | null;
  attack_disability: string | null;
  attack_treatment_response: string | null;
}

export interface ScreeningRecord {
  quiz_type: string;
  score: number | null;
  severity: string | null;
  completed_at: string | null;
}

export interface PredictionRecord {
  predicted_at: string;
  probability: number | null;
  confidence: number | null;
  attack_occurred: boolean | null;
}

export interface PatientDetail {
  summary: PatientSummary;
  participant?: ParticipantInfo | null;
  resilienceTrend: ResilienceTrendPoint[];
  attacks: AttackRecord[];
  screenings: ScreeningRecord[];
  predictions: PredictionRecord[];
}

// --- Zone color helpers (clinical green/yellow/orange/red) ---

export const ZONE_META: Record<
  ResilienceZone,
  { label: string; dot: string; bg: string; text: string; bar: string }
> = {
  strong: {
    label: "Strong",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    bar: "bg-emerald-500",
  },
  moderate: {
    label: "Moderate",
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
    bar: "bg-amber-400",
  },
  at_risk: {
    label: "At risk",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    bar: "bg-orange-500",
  },
  high_risk: {
    label: "High risk",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    bar: "bg-red-500",
  },
};

export function zoneMeta(zone: ResilienceZone | null) {
  return zone ? ZONE_META[zone] : null;
}

// True when an RPC error indicates the account is not on the clinic-staff allowlist.
export function isNotAuthorizedError(message: string | undefined | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("not authorized") || m.includes("not authorised");
}

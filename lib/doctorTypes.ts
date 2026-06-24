// Shapes returned by the Supabase RPCs (doctor_patient_summaries / doctor_patient_detail).
// All fields may be null.

export type ResilienceZone = "strong" | "moderate" | "at_risk" | "high_risk";

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

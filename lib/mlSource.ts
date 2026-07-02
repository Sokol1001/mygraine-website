// Bulk data source for the clinic ML export. Pages the widened, staff-gated
// RPCs added in migration 014 (doctor_ml_daily / _predictions / _patients)
// with keyset pagination, instead of one doctor_patient_detail call per patient.

import { supabase } from "./supabaseClient";

/** One (patient, date) row from doctor_ml_daily — the daily feature panel. */
export interface DailyRow {
  subject_id: string;
  user_id: string | null;
  date: string;
  // daily_logs
  sleep_hours: number | null;
  sleep_bedtime: string | null;
  water_glasses: number | null;
  exercise_minutes: number | null;
  exercise_type: string | null;
  exercise_intensity: string | null;
  meals_eaten: number | null;
  meal_timing_stdev_minutes: number | null;
  stress_level: number | null;
  medication_taken: boolean | null;
  acute_medication_used: boolean | null;
  caffeine_alcohol_count: number | null;
  subjective_restedness: number | null;
  trigger_foods_consumed: number | null;
  is_period_day: boolean | null;
  menstrual_flow: string | null;
  deep_dive_completed: boolean | null;
  // healthkit
  hk_sleep_hours: number | null;
  hk_sleep_efficiency: number | null;
  hk_awakenings: number | null;
  hk_deep_rem_ratio: number | null;
  hk_exercise_minutes: number | null;
  hk_hr_zone: string | null;
  hk_hrv_sdnn: number | null;
  // premonitory (daily aggregate)
  prem_checkins: number | null;
  prem_yawning: number | null;
  prem_cravings: number | null;
  prem_neck_stiffness: number | null;
  prem_sensory_sharper: number | null;
  prem_mood_change: number | null;
  prem_symptom_count: number | null;
  // resilience
  resilience_score: number | null;
  resilience_zone: string | null;
  resilience_confidence: number | null;
  factor_scores: Record<string, number> | null;
  // weather
  pressure_drop_24h_hpa: number | null;
  sharav_active: boolean | null;
  // outcome / labels (same-day = label, not a feature for attack_today)
  attack_today: boolean | null;
  attack_severity: number | null;
  attack_duration_hours: number | null;
  attack_disability: string | null;
  attack_treatment_response: string | null;
}

export interface PredictionRow {
  subject_id: string;
  user_id: string | null;
  predicted_at: string;
  probability: number | null;
  confidence: string | null;
  attack_occurred: boolean | null;
  contributors: unknown;
}

export interface PatientFeatureRow {
  subject_id: string;
  user_id: string | null;
  features: Record<string, unknown>;
}

export interface MlSource {
  daily: DailyRow[];
  predictions: PredictionRow[];
  patients: PatientFeatureRow[];
}

const PAGE = 20000;

/** Thrown when the 014 RPCs aren't deployed yet — surfaced as a friendly hint. */
export class ExportUnavailableError extends Error {
  constructor() {
    super(
      "The ML export needs the latest database update (migration 014). Ask the admin to deploy it, then retry."
    );
    this.name = "ExportUnavailableError";
  }
}

function isMissingFunction(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  // PostgREST when the RPC doesn't exist / schema cache miss.
  return (
    m.includes("could not find the function") ||
    m.includes("does not exist") ||
    m.includes("pgrst202")
  );
}

type Progress = (label: string, count: number) => void;

/** Page doctor_ml_daily by (user_id, date) until a short page. */
async function fetchDaily(onProgress?: Progress): Promise<DailyRow[]> {
  const out: DailyRow[] = [];
  let afterUser: string | null = null;
  let afterDate: string | null = null;
  for (;;) {
    const { data, error } = await supabase.rpc("doctor_ml_daily", {
      p_since: null,
      p_after_user: afterUser,
      p_after_date: afterDate,
      p_limit: PAGE,
    });
    if (error) {
      if (isMissingFunction(error.message)) throw new ExportUnavailableError();
      throw error;
    }
    const rows = (data ?? []) as DailyRow[];
    out.push(...rows);
    onProgress?.("daily rows", out.length);
    if (rows.length < PAGE) break;
    const last = rows[rows.length - 1];
    // Cursor needs the raw ordering key; the RPC always returns it.
    if (!last.user_id) break;
    afterUser = last.user_id;
    afterDate = last.date;
  }
  return out;
}

async function fetchPredictions(onProgress?: Progress): Promise<PredictionRow[]> {
  const out: PredictionRow[] = [];
  let afterUser: string | null = null;
  let afterAt: string | null = null;
  for (;;) {
    const { data, error } = await supabase.rpc("doctor_ml_predictions", {
      p_since: null,
      p_after_user: afterUser,
      p_after_at: afterAt,
      p_limit: PAGE,
    });
    if (error) {
      if (isMissingFunction(error.message)) throw new ExportUnavailableError();
      throw error;
    }
    const rows = (data ?? []) as PredictionRow[];
    out.push(...rows);
    onProgress?.("prediction rows", out.length);
    if (rows.length < PAGE) break;
    const last = rows[rows.length - 1];
    if (!last.user_id) break;
    afterUser = last.user_id;
    afterAt = last.predicted_at;
  }
  return out;
}

async function fetchPatients(): Promise<PatientFeatureRow[]> {
  const { data, error } = await supabase.rpc("doctor_ml_patients");
  if (error) {
    if (isMissingFunction(error.message)) throw new ExportUnavailableError();
    throw error;
  }
  return (data ?? []) as PatientFeatureRow[];
}

/** Fetch the whole clinic's ML source once (all three feeds). */
export async function fetchMlSource(onProgress?: Progress): Promise<MlSource> {
  const [daily, predictions, patients] = [
    await fetchDaily(onProgress),
    await fetchPredictions(onProgress),
    await fetchPatients(),
  ];
  return { daily, predictions, patients };
}

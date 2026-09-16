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

/**
 * Rows requested per page.
 *
 * MUST stay below the project's PostgREST `max_rows` (Dashboard → Settings →
 * API, 1000 by default). This was 20000, which silently broke the export: the
 * server capped every response at max_rows, the `rows.length < PAGE` test was
 * therefore true on the very first page, and the loop exited after 1000 rows.
 * At 200 patients x ~180 days that delivered ~2.8% of the dataset with no
 * error and no warning.
 *
 * The loops below now terminate on an EMPTY page rather than a short one, so
 * the export stays correct even if max_rows is lowered again underneath us.
 */
const PAGE = 500;

/** Hard stop so a non-advancing cursor can never spin forever. */
const MAX_PAGES = 2000;

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
  let pages = 0;
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
    // Terminate on an EMPTY page, never on a short one: the server may cap the
    // response below PAGE, and a short page would then end the export early.
    if (rows.length === 0) break;
    out.push(...rows);
    onProgress?.("daily rows", out.length);
    const last = rows[rows.length - 1];
    // Cursor needs the raw ordering key; the RPC always returns it.
    if (!last.user_id) break;
    // The keyset is (user_id, date) and the RPC orders by it, so the cursor
    // must strictly advance. If it does not, stop rather than loop forever.
    if (last.user_id === afterUser && last.date === afterDate) break;
    afterUser = last.user_id;
    afterDate = last.date;
    if (++pages >= MAX_PAGES) break;
  }
  return out;
}

async function fetchPredictions(onProgress?: Progress): Promise<PredictionRow[]> {
  const out: PredictionRow[] = [];
  let afterUser: string | null = null;
  let afterAt: string | null = null;
  let pages = 0;
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
    if (rows.length === 0) break;
    out.push(...rows);
    onProgress?.("prediction rows", out.length);
    const last = rows[rows.length - 1];
    if (!last.user_id) break;
    if (last.user_id === afterUser && last.predicted_at === afterAt) break;
    afterUser = last.user_id;
    afterAt = last.predicted_at;
    if (++pages >= MAX_PAGES) break;
  }
  return out;
}

/**
 * doctor_ml_patients() takes no limit and returns one row per exporting
 * patient, so it is fully exposed to the PostgREST max_rows cap. One row per
 * patient means a 200-patient pilot is comfortably clear of it, but a silent
 * truncation here would drop whole patients out of the cohort file, so check.
 */
async function fetchPatients(): Promise<PatientFeatureRow[]> {
  const { data, error } = await supabase.rpc("doctor_ml_patients");
  if (error) {
    if (isMissingFunction(error.message)) throw new ExportUnavailableError();
    throw error;
  }
  const rows = (data ?? []) as PatientFeatureRow[];
  // 1000 is the PostgREST default. Landing exactly on it is far more likely to
  // be a cap than a coincidence.
  if (rows.length === 1000) {
    throw new Error(
      "The patient cohort came back with exactly 1000 rows, which is the default " +
        "PostgREST row cap — the export is probably truncated. Raise max_rows " +
        "(Dashboard → Settings → API) or add paging to doctor_ml_patients() before trusting this bundle."
    );
  }
  return rows;
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

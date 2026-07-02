// Machine-learning export for the clinic portal.
//
// Consumes the widened bulk feed (lib/mlSource → migration 014 RPCs) and emits
// tidy, deterministically-sorted, model-ready tables, each targeting a goal:
//
//   attack_prediction_daily — supervised set for "will an attack happen?"
//   prodrome_prediction     — premonitory check-in symptoms → attack
//   prediction_outcomes     — evaluate / retrain the in-app predictor
//   treatment_response      — did the app help this patient? (per patient)
//   patient_cohort          — one static feature row per patient
//
// ML conventions:
//   • booleans → 0/1, missing → "" (empty),
//   • rows sorted by subject_id then date,
//   • resilience factor scores flattened into factor_<name> columns,
//   • same-day attack outcome columns are prefixed label_ (see LEAKAGE below).
//
// LEAKAGE: label_attack_severity / _duration / _disability / _treatment_response
// describe the attack itself — they are labels for attack_today, valid only as
// LAGGED features for attack_next_day. Drop/lag them when modelling attack_today.

import { toCSV } from "./csv";
import type {
  DailyRow,
  MlSource,
  PatientFeatureRow,
  PredictionRow,
} from "./mlSource";

export type DatasetKind =
  | "attack_prediction_daily"
  | "prodrome_prediction"
  | "prediction_outcomes"
  | "treatment_response"
  | "patient_cohort";

export interface Dataset {
  filename: string;
  csv: string;
  rows: number;
}

export interface BuildOpts {
  /** Include the raw user_id column (default false → subject_id only). */
  includeUserId?: boolean;
}

/* ------------------------------- small utils ------------------------------ */

type Row = Record<string, unknown>;
type Header = { key: string; label: string };

function bool01(v: boolean | null | undefined): 0 | 1 | "" {
  if (v === null || v === undefined) return "";
  return v ? 1 : 0;
}
function num(v: number | null | undefined): number | "" {
  return v === null || v === undefined ? "" : v;
}
function str(v: string | null | undefined): string {
  return v ?? "";
}
function dayKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
}
function addDays(day: string, n: number): string {
  const t = Date.parse(`${day}T00:00:00Z`);
  return new Date(t + n * 86_400_000).toISOString().slice(0, 10);
}
function daysSinceNow(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}
function mean(nums: number[]): number | null {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}
function round(n: number | null, dp = 2): number | "" {
  if (n === null) return "";
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
function csvFrom(headers: Header[], rows: Row[]): string {
  return toCSV(headers as { key: keyof Row; label: string }[], rows);
}
function idHeaders(includeUserId: boolean): Header[] {
  const h: Header[] = [{ key: "subject_id", label: "subject_id" }];
  if (includeUserId) h.push({ key: "user_id", label: "user_id" });
  return h;
}
function idCols(
  r: { subject_id: string; user_id: string | null },
  includeUserId: boolean
): Row {
  return includeUserId
    ? { subject_id: r.subject_id, user_id: r.user_id ?? "" }
    : { subject_id: r.subject_id };
}
function groupBySubject<T extends { subject_id: string }>(rows: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const list = m.get(r.subject_id);
    if (list) list.push(r);
    else m.set(r.subject_id, [r]);
  }
  return m;
}

/** subject_id → a few static context fields pulled from patient features. */
function contextBySubject(patients: PatientFeatureRow[]) {
  const m = new Map<string, Record<string, unknown>>();
  for (const p of patients) m.set(p.subject_id, p.features ?? {});
  return m;
}

/* --------------------- 1. Attack-prediction (daily) ----------------------- */

export function buildAttackPredictionDaily(src: MlSource, opts: BuildOpts = {}): Dataset {
  const includeUserId = !!opts.includeUserId;
  const ctx = contextBySubject(src.patients);
  const bySubject = groupBySubject(src.daily);
  const factorKeys = new Set<string>();
  const rows: Row[] = [];

  for (const [, days] of bySubject) {
    const attackDays = new Set(
      days.filter((d) => d.attack_today).map((d) => dayKey(d.date)).filter(Boolean) as string[]
    );
    for (const d of days) {
      const day = dayKey(d.date);
      if (!day) continue;
      const factors = d.factor_scores ?? {};
      for (const k of Object.keys(factors)) factorKeys.add(k);
      const c = ctx.get(d.subject_id) ?? {};

      rows.push({
        ...idCols(d, includeUserId),
        date: day,
        // static context
        phenotype: str(c.phenotype as string | null),
        diagnosis_confidence: num(c.diagnosis_confidence as number | null),
        preventive_drug_class: str(c.preventive_drug_class as string | null),
        tracks_menstrual_cycle: bool01(c.tracks_menstrual_cycle as boolean | null),
        // lifestyle (daily_logs)
        sleep_hours: num(d.sleep_hours),
        water_glasses: num(d.water_glasses),
        exercise_minutes: num(d.exercise_minutes),
        exercise_type: str(d.exercise_type),
        exercise_intensity: str(d.exercise_intensity),
        meals_eaten: num(d.meals_eaten),
        meal_timing_stdev_minutes: num(d.meal_timing_stdev_minutes),
        stress_level: num(d.stress_level),
        medication_taken: bool01(d.medication_taken),
        acute_medication_used: bool01(d.acute_medication_used),
        caffeine_alcohol_count: num(d.caffeine_alcohol_count),
        subjective_restedness: num(d.subjective_restedness),
        trigger_foods_consumed: num(d.trigger_foods_consumed),
        is_period_day: bool01(d.is_period_day),
        menstrual_flow: str(d.menstrual_flow),
        // healthkit
        hk_sleep_hours: num(d.hk_sleep_hours),
        hk_sleep_efficiency: num(d.hk_sleep_efficiency),
        hk_awakenings: num(d.hk_awakenings),
        hk_deep_rem_ratio: num(d.hk_deep_rem_ratio),
        hk_hrv_sdnn: num(d.hk_hrv_sdnn),
        hk_hr_zone: str(d.hk_hr_zone),
        // premonitory
        prem_symptom_count: num(d.prem_symptom_count),
        prem_yawning: num(d.prem_yawning),
        prem_cravings: num(d.prem_cravings),
        prem_neck_stiffness: num(d.prem_neck_stiffness),
        prem_sensory_sharper: num(d.prem_sensory_sharper),
        prem_mood_change: num(d.prem_mood_change),
        // weather
        pressure_drop_24h_hpa: num(d.pressure_drop_24h_hpa),
        sharav_active: bool01(d.sharav_active),
        // resilience
        resilience_score: num(d.resilience_score),
        resilience_zone: str(d.resilience_zone),
        resilience_confidence: num(d.resilience_confidence),
        _factors: factors,
        // labels
        attack_today: d.attack_today ? 1 : 0,
        attack_next_day: attackDays.has(addDays(day, 1)) ? 1 : 0,
        label_attack_severity: num(d.attack_severity),
        label_attack_duration_hours: num(d.attack_duration_hours),
        label_attack_disability: str(d.attack_disability),
        label_attack_treatment_response: str(d.attack_treatment_response),
      });
    }
  }

  const sortedFactors = [...factorKeys].sort();
  for (const r of rows) {
    const factors = (r._factors as Record<string, number>) ?? {};
    for (const k of sortedFactors) r[`factor_${k}`] = k in factors ? round(factors[k], 3) : "";
    delete r._factors;
  }

  const headers: Header[] = [
    ...idHeaders(includeUserId),
    { key: "date", label: "date" },
    { key: "phenotype", label: "phenotype" },
    { key: "diagnosis_confidence", label: "diagnosis_confidence" },
    { key: "preventive_drug_class", label: "preventive_drug_class" },
    { key: "tracks_menstrual_cycle", label: "tracks_menstrual_cycle" },
    { key: "sleep_hours", label: "sleep_hours" },
    { key: "water_glasses", label: "water_glasses" },
    { key: "exercise_minutes", label: "exercise_minutes" },
    { key: "exercise_type", label: "exercise_type" },
    { key: "exercise_intensity", label: "exercise_intensity" },
    { key: "meals_eaten", label: "meals_eaten" },
    { key: "meal_timing_stdev_minutes", label: "meal_timing_stdev_minutes" },
    { key: "stress_level", label: "stress_level" },
    { key: "medication_taken", label: "medication_taken" },
    { key: "acute_medication_used", label: "acute_medication_used" },
    { key: "caffeine_alcohol_count", label: "caffeine_alcohol_count" },
    { key: "subjective_restedness", label: "subjective_restedness" },
    { key: "trigger_foods_consumed", label: "trigger_foods_consumed" },
    { key: "is_period_day", label: "is_period_day" },
    { key: "menstrual_flow", label: "menstrual_flow" },
    { key: "hk_sleep_hours", label: "hk_sleep_hours" },
    { key: "hk_sleep_efficiency", label: "hk_sleep_efficiency" },
    { key: "hk_awakenings", label: "hk_awakenings" },
    { key: "hk_deep_rem_ratio", label: "hk_deep_rem_ratio" },
    { key: "hk_hrv_sdnn", label: "hk_hrv_sdnn" },
    { key: "hk_hr_zone", label: "hk_hr_zone" },
    { key: "prem_symptom_count", label: "prem_symptom_count" },
    { key: "prem_yawning", label: "prem_yawning" },
    { key: "prem_cravings", label: "prem_cravings" },
    { key: "prem_neck_stiffness", label: "prem_neck_stiffness" },
    { key: "prem_sensory_sharper", label: "prem_sensory_sharper" },
    { key: "prem_mood_change", label: "prem_mood_change" },
    { key: "pressure_drop_24h_hpa", label: "pressure_drop_24h_hpa" },
    { key: "sharav_active", label: "sharav_active" },
    { key: "resilience_score", label: "resilience_score" },
    { key: "resilience_zone", label: "resilience_zone" },
    { key: "resilience_confidence", label: "resilience_confidence" },
    ...sortedFactors.map((k) => ({ key: `factor_${k}`, label: `factor_${k}` })),
    { key: "attack_today", label: "attack_today" },
    { key: "attack_next_day", label: "attack_next_day" },
    { key: "label_attack_severity", label: "label_attack_severity" },
    { key: "label_attack_duration_hours", label: "label_attack_duration_hours" },
    { key: "label_attack_disability", label: "label_attack_disability" },
    { key: "label_attack_treatment_response", label: "label_attack_treatment_response" },
  ];

  const sorted = sortRows(rows);
  return { filename: "attack_prediction_daily.csv", csv: csvFrom(headers, sorted), rows: sorted.length };
}

/* ----------------------- 2. Prodrome prediction --------------------------- */

/** Days with at least one premonitory check-in → symptom flags + attack labels. */
export function buildProdromePrediction(src: MlSource, opts: BuildOpts = {}): Dataset {
  const includeUserId = !!opts.includeUserId;
  const bySubject = groupBySubject(src.daily);
  const rows: Row[] = [];

  for (const [, days] of bySubject) {
    const attackDays = new Set(
      days.filter((d) => d.attack_today).map((d) => dayKey(d.date)).filter(Boolean) as string[]
    );
    for (const d of days) {
      if (!d.prem_checkins) continue; // only days a check-in happened
      const day = dayKey(d.date);
      if (!day) continue;
      rows.push({
        ...idCols(d, includeUserId),
        date: day,
        prem_checkins: num(d.prem_checkins),
        yawning: num(d.prem_yawning),
        cravings: num(d.prem_cravings),
        neck_stiffness: num(d.prem_neck_stiffness),
        sensory_sharper: num(d.prem_sensory_sharper),
        mood_change: num(d.prem_mood_change),
        symptom_count: num(d.prem_symptom_count),
        stress_level: num(d.stress_level),
        sleep_hours: num(d.sleep_hours),
        resilience_score: num(d.resilience_score),
        attack_today: d.attack_today ? 1 : 0,
        attack_next_day: attackDays.has(addDays(day, 1)) ? 1 : 0,
      });
    }
  }

  const headers: Header[] = [
    ...idHeaders(includeUserId),
    { key: "date", label: "date" },
    { key: "prem_checkins", label: "prem_checkins" },
    { key: "yawning", label: "yawning" },
    { key: "cravings", label: "cravings" },
    { key: "neck_stiffness", label: "neck_stiffness" },
    { key: "sensory_sharper", label: "sensory_sharper" },
    { key: "mood_change", label: "mood_change" },
    { key: "symptom_count", label: "symptom_count" },
    { key: "stress_level", label: "stress_level" },
    { key: "sleep_hours", label: "sleep_hours" },
    { key: "resilience_score", label: "resilience_score" },
    { key: "attack_today", label: "attack_today" },
    { key: "attack_next_day", label: "attack_next_day" },
  ];
  const sorted = sortRows(rows);
  return { filename: "prodrome_prediction.csv", csv: csvFrom(headers, sorted), rows: sorted.length };
}

/* ----------------------- 3. Prediction outcomes --------------------------- */

export function buildPredictionOutcomes(src: MlSource, opts: BuildOpts = {}): Dataset {
  const includeUserId = !!opts.includeUserId;
  const ctx = contextBySubject(src.patients);
  const rows: Row[] = src.predictions.map((p: PredictionRow) => {
    const c = ctx.get(p.subject_id) ?? {};
    return {
      ...idCols(p, includeUserId),
      predicted_at: dayKey(p.predicted_at) ?? p.predicted_at ?? "",
      probability: num(p.probability),
      confidence: str(p.confidence),
      attack_occurred: bool01(p.attack_occurred),
      phenotype: str(c.phenotype as string | null),
      preventive_drug_class: str(c.preventive_drug_class as string | null),
      contributors_json: p.contributors ? JSON.stringify(p.contributors) : "",
    };
  });

  const headers: Header[] = [
    ...idHeaders(includeUserId),
    { key: "predicted_at", label: "predicted_at" },
    { key: "probability", label: "probability" },
    { key: "confidence", label: "confidence" },
    { key: "attack_occurred", label: "attack_occurred" },
    { key: "phenotype", label: "phenotype" },
    { key: "preventive_drug_class", label: "preventive_drug_class" },
    { key: "contributors_json", label: "contributors_json" },
  ];
  const sorted = [...rows].sort((a, b) => {
    const s = String(a.subject_id).localeCompare(String(b.subject_id));
    return s !== 0 ? s : String(a.predicted_at).localeCompare(String(b.predicted_at));
  });
  return { filename: "prediction_outcomes.csv", csv: csvFrom(headers, sorted), rows: sorted.length };
}

/* --------------------- 4. Treatment response ------------------------------ */

const BASELINE_WINDOW_DAYS = 30;

export function buildTreatmentResponse(src: MlSource, opts: BuildOpts = {}): Dataset {
  const includeUserId = !!opts.includeUserId;
  const ctx = contextBySubject(src.patients);
  const bySubject = groupBySubject(src.daily);
  const rows: Row[] = [];

  for (const [subject, days] of bySubject) {
    const c = ctx.get(subject) ?? {};
    const sorted = [...days].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const first = sorted.find((d) => dayKey(d.date));
    const anyUser = days.find((d) => d.user_id)?.user_id ?? null;

    const scored = sorted
      .map((d) => ({ day: dayKey(d.date), score: d.resilience_score }))
      .filter((d): d is { day: string; score: number } => d.day !== null && d.score !== null);
    const firstDay = scored[0]?.day ?? null;
    const lastDay = scored[scored.length - 1]?.day ?? null;
    const baseline = firstDay
      ? mean(scored.filter((s) => s.day <= addDays(firstDay, BASELINE_WINDOW_DAYS)).map((s) => s.score))
      : null;
    const recent = lastDay
      ? mean(scored.filter((s) => s.day >= addDays(lastDay, -BASELINE_WINDOW_DAYS)).map((s) => s.score))
      : null;
    const resDelta = baseline !== null && recent !== null ? recent - baseline : null;

    const enrol = dayKey(c.member_since as string | null) ?? (first ? dayKey(first.date) : null);
    const attackFirst30 = enrol
      ? days.filter((d) => {
          const day = dayKey(d.date);
          return d.attack_today && day !== null && day >= enrol && day <= addDays(enrol, 30);
        }).length
      : null;
    const attackLast30 = days.filter((d) => {
      const since = daysSinceNow(d.date);
      return d.attack_today && since !== null && since <= 30;
    }).length;
    const freqDelta = attackFirst30 !== null ? attackLast30 - attackFirst30 : null;

    const medVals = days.map((d) => d.medication_taken).filter((v): v is boolean => v !== null);
    const acuteVals = days.map((d) => d.acute_medication_used).filter((v): v is boolean => v !== null);

    const improved =
      resDelta !== null || freqDelta !== null
        ? (resDelta ?? 0) >= 5 || (freqDelta ?? 0) < 0
        : null;

    rows.push({
      subject_id: subject,
      ...(includeUserId ? { user_id: anyUser ?? "" } : {}),
      phenotype: str(c.phenotype as string | null),
      preventive_drug_class: str(c.preventive_drug_class as string | null),
      days_enrolled: num(daysSinceNow(c.member_since as string | null)),
      active_days_logged: sorted.length,
      adherence_rate: medVals.length ? round(mean(medVals.map((v) => (v ? 1 : 0)))) : "",
      acute_use_rate: acuteVals.length ? round(mean(acuteVals.map((v) => (v ? 1 : 0)))) : "",
      resilience_baseline: round(baseline),
      resilience_recent: round(recent),
      resilience_delta: round(resDelta),
      attacks_first_30d: num(attackFirst30),
      attacks_last_30d: attackLast30,
      attack_freq_delta: num(freqDelta),
      phq2_latest: num(c.latest_phq2 as number | null),
      gad2_latest: num(c.latest_gad2 as number | null),
      isi_latest: num(c.latest_isi as number | null),
      improved: bool01(improved),
    });
  }

  const headers: Header[] = [
    ...idHeaders(includeUserId),
    { key: "phenotype", label: "phenotype" },
    { key: "preventive_drug_class", label: "preventive_drug_class" },
    { key: "days_enrolled", label: "days_enrolled" },
    { key: "active_days_logged", label: "active_days_logged" },
    { key: "adherence_rate", label: "adherence_rate" },
    { key: "acute_use_rate", label: "acute_use_rate" },
    { key: "resilience_baseline", label: "resilience_baseline" },
    { key: "resilience_recent", label: "resilience_recent" },
    { key: "resilience_delta", label: "resilience_delta" },
    { key: "attacks_first_30d", label: "attacks_first_30d" },
    { key: "attacks_last_30d", label: "attacks_last_30d" },
    { key: "attack_freq_delta", label: "attack_freq_delta" },
    { key: "phq2_latest", label: "phq2_latest" },
    { key: "gad2_latest", label: "gad2_latest" },
    { key: "isi_latest", label: "isi_latest" },
    { key: "improved", label: "improved" },
  ];
  const sorted = [...rows].sort((a, b) => String(a.subject_id).localeCompare(String(b.subject_id)));
  return { filename: "treatment_response.csv", csv: csvFrom(headers, sorted), rows: sorted.length };
}

/* ----------------------- 5. Patient cohort features ----------------------- */

export function buildPatientCohort(src: MlSource, opts: BuildOpts = {}): Dataset {
  const includeUserId = !!opts.includeUserId;
  const keys = new Set<string>();
  for (const p of src.patients) for (const k of Object.keys(p.features ?? {})) keys.add(k);
  const featureKeys = [...keys].sort();

  const rows: Row[] = src.patients.map((p) => {
    const row: Row = { ...idCols(p, includeUserId) };
    for (const k of featureKeys) {
      const v = (p.features ?? {})[k];
      row[k] = typeof v === "boolean" ? (v ? 1 : 0) : v ?? "";
    }
    return row;
  });

  const headers: Header[] = [
    ...idHeaders(includeUserId),
    ...featureKeys.map((k) => ({ key: k, label: k })),
  ];
  const sorted = [...rows].sort((a, b) => String(a.subject_id).localeCompare(String(b.subject_id)));
  return { filename: "patient_cohort.csv", csv: csvFrom(headers, sorted), rows: sorted.length };
}

/* --------------------------------- shared --------------------------------- */

function sortRows(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => {
    const s = String(a.subject_id).localeCompare(String(b.subject_id));
    if (s !== 0) return s;
    return String(a.date ?? "").localeCompare(String(b.date ?? ""));
  });
}

export function buildDataset(kind: DatasetKind, src: MlSource, opts: BuildOpts = {}): Dataset {
  switch (kind) {
    case "attack_prediction_daily":
      return buildAttackPredictionDaily(src, opts);
    case "prodrome_prediction":
      return buildProdromePrediction(src, opts);
    case "prediction_outcomes":
      return buildPredictionOutcomes(src, opts);
    case "treatment_response":
      return buildTreatmentResponse(src, opts);
    case "patient_cohort":
      return buildPatientCohort(src, opts);
  }
}

/* --------------------------------- bundle --------------------------------- */

function readme(datasets: Dataset[], stamp: string, patients: number): string {
  const lines = datasets.map((d) => `  - ${d.filename.padEnd(28)} ${d.rows} rows`).join("\n");
  return `MyGraine AI — clinic ML export
Generated: ${stamp}
Patients:  ${patients}

FILES
${lines}

DATASETS
  attack_prediction_daily.csv
    Grain: one row per patient per day (every day with any signal, so
    non-attack days carry features). Features: lifestyle (sleep, exercise,
    meals, hydration, stress, caffeine, restedness, menstrual), HealthKit
    (sleep efficiency, awakenings, deep/REM, HRV), premonitory symptom counts,
    weather (pressure drop / sharav), resilience score + flattened factor_*.
    Labels: attack_today, attack_next_day.

  prodrome_prediction.csv
    Grain: one row per day with a premonitory check-in. The 5 symptom flags +
    symptom_count → attack_today / attack_next_day. Targets the prodrome signal.

  prediction_outcomes.csv
    Grain: one row per in-app prediction. probability/confidence vs
    attack_occurred (empty while unresolved). contributors_json holds the raw
    feature attributions. Use to evaluate / retrain the predictor.

  treatment_response.csv
    Grain: one row per patient. Early baseline (first ${BASELINE_WINDOW_DAYS}d) vs recent:
    resilience_delta, attack_freq_delta, adherence_rate, acute_use_rate,
    engagement. 'improved' is a convenience heuristic — the raw components let
    you relabel for your target.

  patient_cohort.csv
    Grain: one row per patient. Static profile + onboarding baselines + latest
    screening scores.

KEYS & CONVENTIONS
  subject_id is a stable, salted, one-way hash — join every file on it. Raw
  user_id is only present if exported with "include raw id". Booleans are 0/1;
  missing values empty; rows sorted by subject_id then date; dates YYYY-MM-DD.

LEAKAGE
  label_attack_* columns describe the attack itself — they are labels for
  attack_today and valid only as LAGGED features for attack_next_day. Drop or
  lag them when modelling attack_today.

NOTE
  Patient-derived health data. Handle per your clinic's data-governance
  (Israel PPL / GDPR-EU) before training or sharing off-site.
`;
}

export function buildBundle(
  src: MlSource,
  stamp: string,
  opts: BuildOpts = {}
): { name: string; entries: { name: string; data: string }[] } {
  const datasets = [
    buildAttackPredictionDaily(src, opts),
    buildProdromePrediction(src, opts),
    buildPredictionOutcomes(src, opts),
    buildTreatmentResponse(src, opts),
    buildPatientCohort(src, opts),
  ];
  const entries = [
    { name: "README.txt", data: readme(datasets, stamp, src.patients.length) },
    ...datasets.map((d) => ({ name: d.filename, data: d.csv })),
  ];
  return { name: `mygraine-ml-datasets-${stamp}.zip`, entries };
}

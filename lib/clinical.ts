// Clinical decision-support helpers for the doctor portal.
//
// Thresholds follow standard instruments and guidelines so the outputs are
// defensible to a neurologist:
//   PHQ-2 >= 3  -> positive depression screen (recommend PHQ-9)
//   GAD-2 >= 3  -> positive anxiety screen   (recommend GAD-7)
//   ISI 8-14 subthreshold / 15-21 moderate / 22-28 severe insomnia
//   >= 8 monthly headache/migraine days -> consider preventive (AHS)
//   >= 15 monthly days -> chronic migraine pattern (ICHD-3)
// These are screening aids only — never a substitute for the clinician.

import type {
  AttackRecord,
  PatientDetail,
  PatientSummary,
  ResilienceTrendPoint,
} from "./doctorTypes";

const PHQ2_POSITIVE = 3;
const GAD2_POSITIVE = 3;
const ISI_MODERATE = 15;
const ISI_SEVERE = 22;
const PREVENTIVE_DAYS = 8;
const CHRONIC_DAYS = 15;
const INACTIVE_DAYS = 14;

export type FlagLevel = "high" | "medium" | "none";
export type FlagTone = "alert" | "warn" | "info" | "good";

export interface Flag {
  tone: FlagTone;
  label: string;
}

/** Days since an ISO date string, or null if unparseable/missing. */
export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

function hasMeds(drugClass: string | null): boolean {
  return !!drugClass && drugClass.toLowerCase() !== "none";
}

/* --------------------------- List-level triage ---------------------------- */

/**
 * Triage level + short reasons for the patient list. "high" surfaces patients
 * who likely need clinical action; "medium" is worth a look.
 */
export function triage(p: PatientSummary): { level: FlagLevel; reasons: string[] } {
  const reasons: string[] = [];
  let high = false;
  let medium = false;

  if (p.latest_zone === "high_risk") {
    high = true;
    reasons.push("High-risk resilience");
  } else if (p.latest_zone === "at_risk") {
    medium = true;
    reasons.push("At-risk resilience");
  }

  if (p.attacks_30d !== null) {
    if (p.attacks_30d >= CHRONIC_DAYS) {
      high = true;
      reasons.push(`${p.attacks_30d} attack days/30d (chronic pattern)`);
    } else if (p.attacks_30d >= PREVENTIVE_DAYS) {
      medium = true;
      reasons.push(`${p.attacks_30d} attack days/30d`);
    }
  }

  // Frequent attacks with no preventive started.
  if (
    p.attacks_30d !== null &&
    p.attacks_30d >= PREVENTIVE_DAYS &&
    !hasMeds(p.preventive_drug_class)
  ) {
    high = true;
    reasons.push("No preventive despite frequency");
  }

  if (p.latest_phq2 !== null && p.latest_phq2 >= PHQ2_POSITIVE) {
    high = true;
    reasons.push(`PHQ-2 ${p.latest_phq2} (positive)`);
  }
  if (p.latest_gad2 !== null && p.latest_gad2 >= GAD2_POSITIVE) {
    medium = true;
    reasons.push(`GAD-2 ${p.latest_gad2} (positive)`);
  }
  if (p.latest_isi !== null) {
    if (p.latest_isi >= ISI_SEVERE) {
      high = true;
      reasons.push(`ISI ${p.latest_isi} (severe insomnia)`);
    } else if (p.latest_isi >= ISI_MODERATE) {
      medium = true;
      reasons.push(`ISI ${p.latest_isi} (moderate insomnia)`);
    }
  }

  const inactive = daysSince(p.last_log_date);
  if (inactive !== null && inactive >= INACTIVE_DAYS) {
    medium = true;
    reasons.push(`Inactive ${inactive}d`);
  } else if (p.last_log_date === null) {
    medium = true;
    reasons.push("No activity yet");
  }

  return { level: high ? "high" : medium ? "medium" : "none", reasons };
}

export function triageRank(level: FlagLevel): number {
  return level === "high" ? 2 : level === "medium" ? 1 : 0;
}

/* ------------------------- Clinic-wide aggregates ------------------------- */

export interface ClinicInsights {
  total: number;
  needsAttention: number;
  highRisk: number;
  zones: { strong: number; moderate: number; at_risk: number; high_risk: number; unknown: number };
  avgResilience: number | null;
  totalAttacks30d: number;
  positiveDepression: number; // PHQ-2 >= 3
  positiveAnxiety: number; // GAD-2 >= 3
  inactive: number; // >= 14d or never
}

export function clinicInsights(patients: PatientSummary[]): ClinicInsights {
  const zones = { strong: 0, moderate: 0, at_risk: 0, high_risk: 0, unknown: 0 };
  let needsAttention = 0;
  let highRisk = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  let totalAttacks30d = 0;
  let positiveDepression = 0;
  let positiveAnxiety = 0;
  let inactive = 0;

  for (const p of patients) {
    if (p.latest_zone) zones[p.latest_zone]++;
    else zones.unknown++;

    const { level } = triage(p);
    if (level !== "none") needsAttention++;
    if (level === "high") highRisk++;

    if (p.latest_resilience_score !== null) {
      scoreSum += p.latest_resilience_score;
      scoreCount++;
    }
    if (p.attacks_30d !== null) totalAttacks30d += p.attacks_30d;
    if (p.latest_phq2 !== null && p.latest_phq2 >= PHQ2_POSITIVE) positiveDepression++;
    if (p.latest_gad2 !== null && p.latest_gad2 >= GAD2_POSITIVE) positiveAnxiety++;

    const since = daysSince(p.last_log_date);
    if (since === null || since >= INACTIVE_DAYS) inactive++;
  }

  return {
    total: patients.length,
    needsAttention,
    highRisk,
    zones,
    avgResilience: scoreCount ? Math.round(scoreSum / scoreCount) : null,
    totalAttacks30d,
    positiveDepression,
    positiveAnxiety,
    inactive,
  };
}

/* ------------------------- Resilience trend math -------------------------- */

/** Trend points come newest-first from the RPC; return oldest-first for charts. */
export function chronological(points: ResilienceTrendPoint[]): ResilienceTrendPoint[] {
  return [...points].reverse();
}

export interface TrendDelta {
  direction: "up" | "down" | "flat";
  delta: number; // latest - earliest in window
  latest: number | null;
}

/** Compare the most recent score to ~2 weeks earlier (or the oldest available). */
export function trendDelta(points: ResilienceTrendPoint[]): TrendDelta {
  const scored = points.filter((p): p is ResilienceTrendPoint & { score: number } => p.score !== null);
  if (scored.length === 0) return { direction: "flat", delta: 0, latest: null };
  // RPC order is newest-first.
  const latest = scored[0].score;
  const earlier = scored[Math.min(scored.length - 1, 13)].score; // up to 14 points back
  const delta = Math.round(latest - earlier);
  return {
    direction: delta >= 5 ? "up" : delta <= -5 ? "down" : "flat",
    delta,
    latest,
  };
}

/* ----------------------- Consultation prep flags -------------------------- */

function attacksInLast30d(attacks: AttackRecord[]): AttackRecord[] {
  return attacks.filter((a) => {
    const d = daysSince(a.date);
    return d !== null && d <= 30;
  });
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Auto-generated talking points for the consultation prep card. Ordered most
 * urgent first. Each is a screening aid — phrased as "consider", not a directive.
 */
export function consultationFlags(detail: PatientDetail): Flag[] {
  const flags: Flag[] = [];
  const s = detail.summary;

  // Attack burden (prefer the 30d window from the attack list; fall back to summary).
  const recent = attacksInLast30d(detail.attacks);
  const attackDays = recent.length || s.attacks_30d || 0;
  if (attackDays >= CHRONIC_DAYS) {
    flags.push({ tone: "alert", label: `${attackDays} attack days in 30d — chronic migraine pattern (ICHD-3 ≥15).` });
  } else if (attackDays >= PREVENTIVE_DAYS) {
    flags.push({ tone: "warn", label: `${attackDays} attack days in 30d — preventive therapy indicated (AHS ≥8).` });
  }
  if (attackDays >= PREVENTIVE_DAYS && !hasMeds(s.preventive_drug_class)) {
    flags.push({ tone: "alert", label: "No preventive medication recorded despite high attack frequency." });
  }

  // Acute treatment efficacy / MOH risk.
  const poorResponse = recent.filter(
    (a) => a.attack_treatment_response === "rarely" || a.attack_treatment_response === "never"
  ).length;
  if (recent.length >= 4 && poorResponse >= Math.ceil(recent.length / 2)) {
    flags.push({ tone: "warn", label: "Acute treatment frequently ineffective — review regimen / medication-overuse risk." });
  }

  // Severity / disability.
  const sev = avg(recent.map((a) => a.attack_severity).filter((n): n is number => n !== null));
  if (sev !== null && sev >= 7) {
    flags.push({ tone: "info", label: `High average attack severity (${sev.toFixed(1)}/10).` });
  }

  // Resilience trajectory.
  const td = trendDelta(detail.resilienceTrend);
  if (td.direction === "down") {
    flags.push({ tone: "warn", label: `Resilience falling (${td.delta} pts over recent period).` });
  } else if (td.direction === "up") {
    flags.push({ tone: "good", label: `Resilience improving (+${td.delta} pts recently).` });
  }
  if (s.latest_zone === "high_risk") {
    flags.push({ tone: "alert", label: "Resilience in the high-risk zone." });
  }

  // Comorbidities — latest screen of each type.
  const latestOf = (q: string) =>
    detail.screenings.filter((x) => x.quiz_type?.toLowerCase().startsWith(q))[0];
  const phq = latestOf("phq");
  const gad = latestOf("gad");
  const isi = latestOf("isi");
  if (phq?.score != null && phq.score >= PHQ2_POSITIVE) {
    flags.push({ tone: "warn", label: `Positive depression screen (PHQ-2 ${phq.score}) — consider PHQ-9.` });
  }
  if (gad?.score != null && gad.score >= GAD2_POSITIVE) {
    flags.push({ tone: "warn", label: `Positive anxiety screen (GAD-2 ${gad.score}) — consider GAD-7.` });
  }
  if (isi?.score != null && isi.score >= ISI_MODERATE) {
    flags.push({
      tone: "warn",
      label: `Clinically significant insomnia (ISI ${isi.score}) — sleep is a migraine trigger.`,
    });
  }

  // Cycle.
  if (s.tracks_menstrual_cycle) {
    flags.push({ tone: "info", label: "Tracks menstrual cycle — review for menstrual migraine pattern." });
  }

  // Engagement.
  const inactive = daysSince(s.last_log_date);
  if (inactive !== null && inactive >= INACTIVE_DAYS) {
    flags.push({ tone: "info", label: `No app activity for ${inactive} days — engagement may be dropping.` });
  } else if (s.last_log_date === null) {
    flags.push({ tone: "info", label: "No logging activity yet." });
  }

  if (flags.length === 0) {
    flags.push({ tone: "good", label: "No flags — patient appears stable on current data." });
  }
  return flags;
}

/* --------------------------- Date-range filtering ------------------------- */

export type RangeKey = "30d" | "90d" | "1y" | "all";

export const RANGE_DAYS: Record<RangeKey, number | null> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
  all: null,
};

export const RANGE_LABEL: Record<RangeKey, string> = {
  "30d": "30 days",
  "90d": "90 days",
  "1y": "1 year",
  all: "All time",
};

/** Keep items whose date field falls within the window (null window = all). */
export function withinRange<T>(
  items: T[],
  dateKey: keyof T,
  range: RangeKey
): T[] {
  const days = RANGE_DAYS[range];
  if (days === null) return items;
  return items.filter((it) => {
    const d = daysSince(it[dateKey] as unknown as string | null);
    return d !== null && d <= days;
  });
}

/* ----------------------------- Attack burden ------------------------------ */

export interface AttackBurden {
  count: number;
  avgSeverity: number | null;
  avgDuration: number | null;
}

export function attackBurden(attacks: AttackRecord[], days: number): AttackBurden {
  const inWin = attacks.filter((a) => {
    const d = daysSince(a.date);
    return d !== null && d <= days;
  });
  return {
    count: inWin.length,
    avgSeverity: avg(inWin.map((a) => a.attack_severity).filter((n): n is number => n !== null)),
    avgDuration: avg(
      inWin.map((a) => a.attack_duration_hours).filter((n): n is number => n !== null)
    ),
  };
}

/** Attack days bucketed by calendar month, oldest-first, for a small bar chart. */
export function monthlyAttackBuckets(
  attacks: AttackRecord[],
  months: number
): { label: string; count: number }[] {
  const now = new Date();
  const buckets: { key: string; label: string; count: number }[] = [];
  const idx = new Map<string, number>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString("en-GB", { month: "short" });
    idx.set(key, buckets.length);
    buckets.push({ key, label, count: 0 });
  }
  for (const a of attacks) {
    const t = a.date ? new Date(a.date) : null;
    if (!t || Number.isNaN(t.getTime())) continue;
    const key = `${t.getFullYear()}-${t.getMonth()}`;
    const i = idx.get(key);
    if (i !== undefined) buckets[i].count++;
  }
  return buckets.map(({ label, count }) => ({ label, count }));
}

/* --------------------------- Prediction accuracy -------------------------- */

export interface PredictionAccuracy {
  resolved: number;
  accuracyPct: number | null;
}

/** Of resolved predictions, share where the call matched the outcome (>=50% prob ⇒ attack expected). */
export function predictionAccuracy(
  predictions: { probability: number | null; attack_occurred: boolean | null }[]
): PredictionAccuracy {
  const resolved = predictions.filter((p) => p.attack_occurred !== null && p.probability !== null);
  if (resolved.length === 0) return { resolved: 0, accuracyPct: null };
  let correct = 0;
  for (const p of resolved) {
    const prob = (p.probability as number) <= 1 ? (p.probability as number) * 100 : (p.probability as number);
    const predicted = prob >= 50;
    if (predicted === p.attack_occurred) correct++;
  }
  return { resolved: resolved.length, accuracyPct: Math.round((correct / resolved.length) * 100) };
}

export const FLAG_TONE_CLASS: Record<FlagTone, string> = {
  alert: "bg-red-50 text-red-700 border-red-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  info: "bg-lilac text-violet border-violet/20",
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

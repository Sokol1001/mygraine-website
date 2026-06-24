"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  isNotAuthorizedError,
  zoneMeta,
  type AttackRecord,
  type PatientDetail,
  type PredictionRecord,
  type ResilienceTrendPoint,
  type ScreeningRecord,
} from "@/lib/doctorTypes";

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtPct(n: number | null): string {
  if (n === null || n === undefined) return "—";
  // Accept either 0..1 or 0..100.
  const pct = n <= 1 ? n * 100 : n;
  return `${Math.round(pct)}%`;
}

export default function PatientDetailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // /doctor/patient?id=<userId>
  const userId = searchParams.get("id") || "";

  const [checkedSession, setCheckedSession] = useState(false);
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotAuthorized(false);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.replace("/doctor");
      return;
    }
    setCheckedSession(true);

    const { data, error: rpcError } = await supabase.rpc(
      "doctor_patient_detail",
      { p_user_id: userId }
    );
    if (rpcError) {
      if (isNotAuthorizedError(rpcError.message)) {
        setNotAuthorized(true);
      } else {
        setError(rpcError.message);
      }
      setDetail(null);
    } else {
      setDetail(data as PatientDetail);
    }
    setLoading(false);
  }, [router, userId]);

  useEffect(() => {
    if (userId) load();
  }, [load, userId]);

  const summary = detail?.summary;
  const title = summary?.name || summary?.email || "Patient";

  return (
    <main className="min-h-screen bg-paper" dir="ltr">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/doctor"
            className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-violet"
          >
            <ArrowLeft className="w-4 h-4" />
            All patients
          </Link>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-violet" />
            <span className="font-display text-lg text-ink">Clinic Portal</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {!checkedSession && loading && (
          <div className="flex items-center gap-2 text-ink/60 text-sm py-16 justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-violet" />
            Loading…
          </div>
        )}

        {notAuthorized && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 max-w-xl">
            <div className="flex items-center gap-2 font-medium mb-1">
              <AlertCircle className="w-5 h-5" />
              Not authorized
            </div>
            <p className="text-sm text-amber-700">
              This account isn&apos;t authorized as clinic staff. Contact the
              admin.
            </p>
          </div>
        )}

        {error && !notAuthorized && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 max-w-xl">
            <div className="flex items-center gap-2 font-medium mb-1">
              <AlertCircle className="w-5 h-5" />
              Couldn&apos;t load patient
            </div>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={load}
              className="mt-3 rounded-full bg-ink text-paper px-4 py-1.5 text-sm hover:bg-violet transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {detail && summary && (
          <>
            <SummaryHeader title={title} summary={summary} />
            <div className="grid lg:grid-cols-2 gap-6">
              <ResilienceTrend points={detail.resilienceTrend ?? []} />
              <RecentAttacks attacks={detail.attacks ?? []} />
              <ScreeningHistory screenings={detail.screenings ?? []} />
              <Predictions predictions={detail.predictions ?? []} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ------------------------------ Summary header ----------------------------- */

function SummaryHeader({
  title,
  summary,
}: {
  title: string;
  summary: PatientDetail["summary"];
}) {
  const zm = zoneMeta(summary.latest_zone);
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">{title}</h1>
          {summary.email && (
            <p className="text-sm text-ink/60">{summary.email}</p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-ink/50 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            Member since {fmtDate(summary.member_since)}
          </div>
        </div>
        {(summary.latest_zone || summary.latest_resilience_score !== null) && (
          <div
            className={`rounded-2xl px-5 py-3 text-center ${
              zm ? zm.bg : "bg-paper"
            }`}
          >
            <div className={`text-3xl font-semibold ${zm ? zm.text : "text-ink"}`}>
              {summary.latest_resilience_score !== null
                ? Math.round(summary.latest_resilience_score)
                : "—"}
            </div>
            <div className={`text-xs font-medium ${zm ? zm.text : "text-ink/50"}`}>
              {zm ? zm.label : "Resilience"}
            </div>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-line">
        <Field label="Phenotype" value={summary.phenotype} />
        <Field
          label="Dx confidence"
          value={
            summary.diagnosis_confidence !== null
              ? fmtPct(summary.diagnosis_confidence)
              : null
          }
        />
        <Field label="Drug class" value={summary.preventive_drug_class} />
        <Field
          label="Cycle tracking"
          value={
            summary.tracks_menstrual_cycle === null
              ? null
              : summary.tracks_menstrual_cycle
              ? "Yes"
              : "No"
          }
        />
      </dl>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="text-sm font-medium text-ink mt-0.5">{value || "—"}</dd>
    </div>
  );
}

/* ------------------------------ Card wrapper ------------------------------- */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-ink mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-ink/50 py-2">{text}</p>;
}

/* ----------------------------- Resilience trend ---------------------------- */

function ResilienceTrend({ points }: { points: ResilienceTrendPoint[] }) {
  return (
    <Card title="Resilience trend">
      {points.length === 0 ? (
        <Empty text="No resilience history yet." />
      ) : (
        <div className="space-y-2">
          {points.map((pt, i) => {
            const zm = zoneMeta(pt.zone);
            const score = pt.score ?? 0;
            return (
              <div key={`${pt.date}-${i}`} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-xs text-ink/60">
                  {fmtDate(pt.date)}
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-paper overflow-hidden">
                  <div
                    className={`h-full rounded-full ${zm ? zm.bar : "bg-violet"}`}
                    style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                  />
                </div>
                <div className="w-10 shrink-0 text-right text-xs font-medium text-ink">
                  {pt.score !== null ? Math.round(pt.score) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------ Recent attacks ----------------------------- */

function RecentAttacks({ attacks }: { attacks: AttackRecord[] }) {
  return (
    <Card title="Recent attacks">
      {attacks.length === 0 ? (
        <Empty text="No attacks logged." />
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-2 py-1.5 font-medium">Date</th>
                <th className="px-2 py-1.5 font-medium text-center">Severity</th>
                <th className="px-2 py-1.5 font-medium text-center">Hours</th>
                <th className="px-2 py-1.5 font-medium">Disability</th>
                <th className="px-2 py-1.5 font-medium">Response</th>
              </tr>
            </thead>
            <tbody>
              {attacks.map((a, i) => (
                <tr key={`${a.date}-${i}`} className="border-t border-line/60">
                  <td className="px-2 py-2 text-ink/80">{fmtDate(a.date)}</td>
                  <td className="px-2 py-2 text-center text-ink/80">
                    {a.attack_severity ?? "—"}
                  </td>
                  <td className="px-2 py-2 text-center text-ink/80">
                    {a.attack_duration_hours ?? "—"}
                  </td>
                  <td className="px-2 py-2 text-ink/80">
                    {a.attack_disability || "—"}
                  </td>
                  <td className="px-2 py-2 text-ink/80">
                    {a.attack_treatment_response || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ----------------------------- Screening history --------------------------- */

function ScreeningHistory({ screenings }: { screenings: ScreeningRecord[] }) {
  return (
    <Card title="Screening history">
      {screenings.length === 0 ? (
        <Empty text="No screenings completed." />
      ) : (
        <div className="space-y-2">
          {screenings.map((s, i) => (
            <div
              key={`${s.quiz_type}-${s.completed_at}-${i}`}
              className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5"
            >
              <div>
                <div className="text-sm font-medium text-ink uppercase">
                  {s.quiz_type}
                </div>
                <div className="text-xs text-ink/50">
                  {fmtDate(s.completed_at)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-ink">
                  {s.score ?? "—"}
                </div>
                {s.severity && (
                  <div className="text-xs text-ink/60">{s.severity}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------- Predictions ------------------------------- */

function Predictions({ predictions }: { predictions: PredictionRecord[] }) {
  return (
    <Card title="Attack predictions">
      {predictions.length === 0 ? (
        <Empty text="No predictions recorded." />
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-2 py-1.5 font-medium">Date</th>
                <th className="px-2 py-1.5 font-medium text-center">
                  Probability
                </th>
                <th className="px-2 py-1.5 font-medium text-center">
                  Confidence
                </th>
                <th className="px-2 py-1.5 font-medium text-center">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => (
                <tr
                  key={`${p.predicted_at}-${i}`}
                  className="border-t border-line/60"
                >
                  <td className="px-2 py-2 text-ink/80">
                    {fmtDate(p.predicted_at)}
                  </td>
                  <td className="px-2 py-2 text-center text-ink/80">
                    {fmtPct(p.probability)}
                  </td>
                  <td className="px-2 py-2 text-center text-ink/80">
                    {fmtPct(p.confidence)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {p.attack_occurred === null ? (
                      <span className="text-ink/40">—</span>
                    ) : p.attack_occurred ? (
                      <span className="inline-flex rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium">
                        Attack
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                        No attack
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

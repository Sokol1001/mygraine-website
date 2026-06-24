"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  Loader2,
  Printer,
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
import {
  chronological,
  consultationFlags,
  FLAG_TONE_CLASS,
  trendDelta,
} from "@/lib/clinical";

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
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur-md print:hidden">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/doctor"
            className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-violet"
          >
            <ArrowLeft className="w-4 h-4" />
            All patients
          </Link>
          <div className="flex items-center gap-3">
            {detail && summary && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-lilac transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print / PDF
              </button>
            )}
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-violet" />
              <span className="font-display text-lg text-ink">Clinic Portal</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 print:py-2 print:px-0">
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
            <PrintHeader title={title} />
            <SummaryHeader title={title} summary={summary} detail={detail} />
            <ConsultationPrep detail={detail} />
            <div className="grid lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-3">
              <ResilienceTrend points={detail.resilienceTrend ?? []} />
              <RecentAttacks attacks={detail.attacks ?? []} />
              <ScreeningHistory screenings={detail.screenings ?? []} />
              <Predictions predictions={detail.predictions ?? []} />
            </div>
            <p className="hidden print:block text-xs text-ink/40 mt-4">
              Generated from MyGraine AI patient data · {fmtDate(new Date().toISOString())} ·
              Screening aid only — not a substitute for clinical judgment.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

/* ------------------------------- Print header ------------------------------ */

function PrintHeader({ title }: { title: string }) {
  return (
    <div className="hidden print:flex items-center justify-between border-b border-line pb-2 mb-2">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-violet" />
        <span className="font-display text-base text-ink">
          MyGraine AI — Patient Report
        </span>
      </div>
      <span className="text-sm text-ink/60">{title}</span>
    </div>
  );
}

/* ------------------------------ Summary header ----------------------------- */

function SummaryHeader({
  title,
  summary,
  detail,
}: {
  title: string;
  summary: PatientDetail["summary"];
  detail: PatientDetail;
}) {
  const zm = zoneMeta(summary.latest_zone);
  const td = trendDelta(detail.resilienceTrend ?? []);
  const trendStr =
    td.latest === null
      ? null
      : td.direction === "flat"
      ? "stable"
      : `${td.delta > 0 ? "+" : ""}${td.delta}`;
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm print:p-3 print:shadow-none">
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
              {trendStr ? ` · ${trendStr}` : ""}
            </div>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-line print:mt-3 print:pt-3">
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

/* --------------------------- Consultation prep ----------------------------- */

function ConsultationPrep({ detail }: { detail: PatientDetail }) {
  const flags = consultationFlags(detail);
  return (
    <section className="rounded-2xl border border-violet/20 bg-lilac/40 p-6 shadow-sm print:p-3 print:shadow-none print:bg-white print:border-line">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-violet" />
        <h2 className="font-display text-lg text-ink">Consultation prep</h2>
      </div>
      <ul className="space-y-2">
        {flags.map((f, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${FLAG_TONE_CLASS[f.tone]}`}
          >
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-70" />
            <span>{f.label}</span>
          </li>
        ))}
      </ul>
    </section>
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
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm print:p-3 print:shadow-none break-inside-avoid">
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
  const series = chronological(points).filter(
    (p): p is ResilienceTrendPoint & { score: number } => p.score !== null
  );
  return (
    <Card title="Resilience trend">
      {series.length === 0 ? (
        <Empty text="No resilience history yet." />
      ) : series.length === 1 ? (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-ink">
            {Math.round(series[0].score)}
          </span>
          <span className="text-sm text-ink/50">
            single reading · {fmtDate(series[0].date)}
          </span>
        </div>
      ) : (
        <LineChart series={series} />
      )}
    </Card>
  );
}

function LineChart({
  series,
}: {
  series: (ResilienceTrendPoint & { score: number })[];
}) {
  const W = 460;
  const H = 140;
  const pad = { l: 8, r: 8, t: 12, b: 18 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = series.length;
  const x = (i: number) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + (1 - Math.max(0, Math.min(100, v)) / 100) * ih;

  const linePts = series.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const areaPts = `${pad.l},${pad.t + ih} ${linePts} ${pad.l + iw},${pad.t + ih}`;
  const last = series[n - 1];
  const first = series[0];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        role="img"
        aria-label="Resilience score over time"
      >
        {[0, 50, 100].map((g) => (
          <line
            key={g}
            x1={pad.l}
            x2={pad.l + iw}
            y1={y(g)}
            y2={y(g)}
            stroke="rgba(33,30,38,0.08)"
            strokeWidth={1}
          />
        ))}
        <polygon points={areaPts} fill="rgba(91,91,214,0.10)" />
        <polyline
          points={linePts}
          fill="none"
          stroke="#5b5bd6"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {series.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.score)} r={i === n - 1 ? 3.5 : 2} fill="#5b5bd6" />
        ))}
      </svg>
      <div className="flex items-center justify-between text-xs text-ink/50 mt-1">
        <span>
          {fmtDate(first.date)} · {Math.round(first.score)}
        </span>
        <span className="font-medium text-ink">
          Latest {Math.round(last.score)} · {fmtDate(last.date)}
        </span>
      </div>
    </div>
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
              {attacks.slice(0, 12).map((a, i) => (
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
          {attacks.length > 12 && (
            <p className="text-xs text-ink/40 mt-2 px-2">
              Showing 12 of {attacks.length} logged attacks.
            </p>
          )}
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
          {screenings.slice(0, 12).map((s, i) => (
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
              {predictions.slice(0, 12).map((p, i) => (
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

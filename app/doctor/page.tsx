"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  ChevronRight,
  Download,
  Loader2,
  LogOut,
  Search,
  Stethoscope,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  isNotAuthorizedError,
  zoneMeta,
  type PatientSummary,
} from "@/lib/doctorTypes";
import { clinicInsights, triage, triageRank } from "@/lib/clinical";
import { downloadCSV, toCSV } from "@/lib/csv";

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

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

function scoreLabel(score: number | null): string {
  if (score === null || score === undefined) return "—";
  return `${Math.round(score)}`;
}

export default function DoctorPortalPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (sessionLoading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet" />
      </main>
    );
  }

  return session ? (
    <ClinicList onSignOut={() => supabase.auth.signOut()} />
  ) : (
    <LoginForm />
  );
}

/* ---------------------------------- Login --------------------------------- */

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
    }
    // On success, onAuthStateChange flips the parent to the clinic list.
  };

  return (
    <main
      className="min-h-screen bg-paper flex items-center justify-center px-6"
      dir="ltr"
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-violet" />
          </div>
          <span className="font-display text-xl text-ink">Clinic Portal</span>
        </div>

        <div className="bg-white rounded-2xl border border-line p-7 shadow-sm">
          <h1 className="font-display text-2xl text-ink mb-1">Sign in</h1>
          <p className="text-sm text-ink/60 mb-6">
            Authorized clinic staff only.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink/80 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                placeholder="doctor@clinic.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink/80 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink text-paper py-2.5 text-sm font-medium hover:bg-violet transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------- Clinic list ------------------------------ */

type SortKey = "attention" | "name" | "resilience" | "attacks" | "active";

function ClinicList({ onSignOut }: { onSignOut: () => void }) {
  const [rows, setRows] = useState<PatientSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("attention");
  const [onlyAttention, setOnlyAttention] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotAuthorized(false);
    const { data, error: rpcError } = await supabase.rpc(
      "doctor_patient_summaries"
    );
    if (rpcError) {
      if (isNotAuthorizedError(rpcError.message)) {
        setNotAuthorized(true);
      } else {
        setError(rpcError.message);
      }
      setRows(null);
    } else {
      setRows((data ?? []) as PatientSummary[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const insights = useMemo(() => (rows ? clinicInsights(rows) : null), [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    let list = rows.map((p) => ({ p, t: triage(p) }));
    if (q) {
      list = list.filter(
        ({ p }) =>
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q) ||
          (p.phenotype ?? "").toLowerCase().includes(q)
      );
    }
    if (onlyAttention) list = list.filter(({ t }) => t.level !== "none");
    list.sort((a, b) => {
      switch (sort) {
        case "name":
          return (a.p.name ?? a.p.email ?? "").localeCompare(
            b.p.name ?? b.p.email ?? ""
          );
        case "resilience":
          return (a.p.latest_resilience_score ?? 999) - (b.p.latest_resilience_score ?? 999);
        case "attacks":
          return (b.p.attacks_30d ?? -1) - (a.p.attacks_30d ?? -1);
        case "active":
          return (b.p.last_log_date ?? "").localeCompare(a.p.last_log_date ?? "");
        case "attention":
        default: {
          const d = triageRank(b.t.level) - triageRank(a.t.level);
          if (d !== 0) return d;
          return (b.p.attacks_30d ?? -1) - (a.p.attacks_30d ?? -1);
        }
      }
    });
    return list;
  }, [rows, query, sort, onlyAttention]);

  const exportCSV = useCallback(() => {
    const csv = toCSV(
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phenotype", label: "Phenotype" },
        { key: "diagnosis_confidence", label: "Dx confidence" },
        { key: "preventive_drug_class", label: "Drug class" },
        { key: "latest_resilience_score", label: "Resilience" },
        { key: "latest_zone", label: "Zone" },
        { key: "attacks_30d", label: "Attacks 30d" },
        { key: "latest_phq2", label: "PHQ-2" },
        { key: "latest_gad2", label: "GAD-2" },
        { key: "latest_isi", label: "ISI" },
        { key: "last_log_date", label: "Last active" },
        { key: "attention", label: "Attention" },
        { key: "reasons", label: "Flags" },
      ],
      visible.map(({ p, t }) => ({ ...p, attention: t.level, reasons: t.reasons.join("; ") }))
    );
    downloadCSV(`clinic-patients-${todayStamp()}.csv`, csv);
  }, [visible]);

  return (
    <main className="min-h-screen bg-paper" dir="ltr">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-violet" />
            </div>
            <span className="font-display text-lg text-ink">Clinic Portal</span>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-lilac transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-ink">Clinic overview</h1>
          <p className="text-sm text-ink/60 mt-1">
            {rows ? `${rows.length} patient${rows.length === 1 ? "" : "s"}` : ""}
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-ink/60 text-sm py-16 justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-violet" />
            Loading patients…
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
              Couldn&apos;t load patients
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

        {rows && rows.length === 0 && !loading && (
          <div className="rounded-2xl border border-line bg-white p-10 text-center text-ink/60">
            No patients found.
          </div>
        )}

        {rows && rows.length > 0 && insights && (
          <>
            <InsightsBand insights={insights} />

            <div className="flex flex-wrap items-center gap-3 mt-8 mb-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, phenotype…"
                  className="w-full rounded-full border border-line bg-white pl-9 pr-4 py-2 text-sm text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                />
              </div>
              <button
                onClick={() => setOnlyAttention((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  onlyAttention
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-line bg-white text-ink/70 hover:bg-lilac"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Needs attention
              </button>
              <div className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm">
                <ArrowUpDown className="w-3.5 h-3.5 text-ink/40" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent text-ink/80 outline-none cursor-pointer"
                >
                  <option value="attention">Priority</option>
                  <option value="name">Name</option>
                  <option value="resilience">Lowest resilience</option>
                  <option value="attacks">Most attacks</option>
                  <option value="active">Recently active</option>
                </select>
              </div>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink/70 hover:bg-lilac transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <p className="text-xs text-ink/50 mb-3">
              Showing {visible.length} of {rows.length}
            </p>

            <PatientTable rows={visible} />
          </>
        )}
      </div>
    </main>
  );
}

/* ----------------------------- Insights band ------------------------------ */

function InsightsBand({
  insights,
}: {
  insights: ReturnType<typeof clinicInsights>;
}) {
  const z = insights.zones;
  const total = insights.total || 1;
  const seg = (n: number, cls: string) =>
    n > 0 ? (
      <div className={cls} style={{ width: `${(n / total) * 100}%` }} title={`${n}`} />
    ) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Patients"
        value={insights.total}
        sub={`${insights.inactive} inactive`}
      />
      <Stat
        label="Need attention"
        value={insights.needsAttention}
        sub={`${insights.highRisk} high priority`}
        accent={insights.needsAttention > 0 ? "red" : "default"}
      />
      <Stat
        label="Avg resilience"
        value={insights.avgResilience ?? "—"}
        sub={`${insights.totalAttacks30d} attack days / 30d`}
      />
      <Stat
        label="Positive screens"
        value={insights.positiveDepression + insights.positiveAnxiety}
        sub={`${insights.positiveDepression} dep · ${insights.positiveAnxiety} anx`}
        accent={
          insights.positiveDepression + insights.positiveAnxiety > 0
            ? "amber"
            : "default"
        }
      />

      <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wide text-ink/50">
            Resilience distribution
          </span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-paper">
          {seg(z.strong, "bg-emerald-500")}
          {seg(z.moderate, "bg-amber-400")}
          {seg(z.at_risk, "bg-orange-500")}
          {seg(z.high_risk, "bg-red-500")}
          {seg(z.unknown, "bg-line")}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
          <Legend dot="bg-emerald-500" label="Strong" n={z.strong} />
          <Legend dot="bg-amber-400" label="Moderate" n={z.moderate} />
          <Legend dot="bg-orange-500" label="At risk" n={z.at_risk} />
          <Legend dot="bg-red-500" label="High risk" n={z.high_risk} />
          <Legend dot="bg-ink/20" label="No data" n={z.unknown} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent = "default",
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "default" | "red" | "amber";
}) {
  const valueCls =
    accent === "red"
      ? "text-red-600"
      : accent === "amber"
      ? "text-amber-600"
      : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${valueCls}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink/50">{sub}</div>}
    </div>
  );
}

function Legend({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label} · {n}
    </span>
  );
}

/* ------------------------------- Patient table ----------------------------- */

function PatientTable({
  rows,
}: {
  rows: { p: PatientSummary; t: ReturnType<typeof triage> }[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
            <th className="px-4 py-3 font-medium">Patient</th>
            <th className="px-4 py-3 font-medium">Phenotype</th>
            <th className="px-4 py-3 font-medium">Resilience</th>
            <th className="px-4 py-3 font-medium text-center">Attacks 30d</th>
            <th className="px-4 py-3 font-medium text-center">PHQ-2</th>
            <th className="px-4 py-3 font-medium text-center">GAD-2</th>
            <th className="px-4 py-3 font-medium text-center">ISI</th>
            <th className="px-4 py-3 font-medium">Last active</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ p, t }) => {
            const zm = zoneMeta(p.latest_zone);
            return (
              <tr
                key={p.user_id}
                className="border-b border-line/60 last:border-0 hover:bg-paper/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {t.level !== "none" && (
                      <span
                        className={`w-1.5 h-5 rounded-full shrink-0 ${
                          t.level === "high" ? "bg-red-500" : "bg-amber-400"
                        }`}
                        title={t.reasons.join(" · ")}
                      />
                    )}
                    <div>
                      <Link
                        href={`/doctor/patient?id=${p.user_id}`}
                        className="font-medium text-ink hover:text-violet"
                      >
                        {p.name || p.email || "Unknown"}
                      </Link>
                      {p.name && p.email && (
                        <div className="text-xs text-ink/50">{p.email}</div>
                      )}
                      {t.level !== "none" && (
                        <div className="text-xs text-ink/45 mt-0.5">
                          {t.reasons[0]}
                          {t.reasons.length > 1 ? ` +${t.reasons.length - 1}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink/80">{p.phenotype || "—"}</td>
                <td className="px-4 py-3">
                  {p.latest_zone || p.latest_resilience_score !== null ? (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        zm ? `${zm.bg} ${zm.text}` : "bg-paper text-ink/60"
                      }`}
                    >
                      {zm && (
                        <span className={`w-1.5 h-1.5 rounded-full ${zm.dot}`} />
                      )}
                      {scoreLabel(p.latest_resilience_score)}
                      {zm ? ` · ${zm.label}` : ""}
                    </span>
                  ) : (
                    <span className="text-ink/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-ink/80">
                    {p.attacks_30d !== null && p.attacks_30d > 0 && (
                      <Activity className="w-3.5 h-3.5 text-ink/40" />
                    )}
                    {p.attacks_30d ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreCell value={p.latest_phq2} positive={p.latest_phq2 !== null && p.latest_phq2 >= 3} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreCell value={p.latest_gad2} positive={p.latest_gad2 !== null && p.latest_gad2 >= 3} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreCell value={p.latest_isi} positive={p.latest_isi !== null && p.latest_isi >= 15} />
                </td>
                <td className="px-4 py-3 text-ink/70">{fmtDate(p.last_log_date)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/doctor/patient?id=${p.user_id}`}
                    className="inline-flex items-center text-ink/40 hover:text-violet"
                    aria-label="View patient"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ScoreCell({ value, positive }: { value: number | null; positive: boolean }) {
  if (value === null || value === undefined) return <span className="text-ink/40">—</span>;
  return (
    <span
      className={
        positive
          ? "inline-flex min-w-[1.5rem] justify-center rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-700"
          : "text-ink/80"
      }
    >
      {value}
    </span>
  );
}

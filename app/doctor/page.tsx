"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import {
  Activity,
  AlertCircle,
  ChevronRight,
  Loader2,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  isNotAuthorizedError,
  zoneMeta,
  type PatientSummary,
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

function ClinicList({ onSignOut }: { onSignOut: () => void }) {
  const [rows, setRows] = useState<PatientSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

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
          <h1 className="font-display text-2xl text-ink">Patients</h1>
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

        {rows && rows.length > 0 && <PatientTable rows={rows} />}
      </div>
    </main>
  );
}

function PatientTable({ rows }: { rows: PatientSummary[] }) {
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
          {rows.map((p) => {
            const zm = zoneMeta(p.latest_zone);
            return (
              <tr
                key={p.user_id}
                className="border-b border-line/60 last:border-0 hover:bg-paper/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/doctor/patient?id=${p.user_id}`}
                    className="font-medium text-ink hover:text-violet"
                  >
                    {p.name || p.email || "Unknown"}
                  </Link>
                  {p.name && p.email && (
                    <div className="text-xs text-ink/50">{p.email}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {p.phenotype || "—"}
                </td>
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
                <td className="px-4 py-3 text-center text-ink/80">
                  {p.latest_phq2 ?? "—"}
                </td>
                <td className="px-4 py-3 text-center text-ink/80">
                  {p.latest_gad2 ?? "—"}
                </td>
                <td className="px-4 py-3 text-center text-ink/80">
                  {p.latest_isi ?? "—"}
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {fmtDate(p.last_log_date)}
                </td>
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

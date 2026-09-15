"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  COHORT_CLASS,
  COHORTS,
  cohortLabel,
  isNotAuthorizedError,
  type Cohort,
  type InviteRow,
  type ParticipantRow,
} from "@/lib/doctorTypes";

/*
 * Participants & invite codes (migration 034).
 *
 * The clinic roster (/doctor) only ever shows exporting cohorts. This page is
 * the one place that lists EVERY account — unassigned signups first — so staff
 * can promote a real patient, mark a colleague as internal, and mint the codes
 * that put new patients in the right cohort from the start.
 */

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const MINTABLE: Exclude<Cohort, "unknown">[] = ["clinic_patient", "friend_family", "internal_tester"];

const STATUS_CLASS: Record<InviteRow["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-slate-100 text-slate-600",
  exhausted: "bg-slate-100 text-slate-600",
  revoked: "bg-red-50 text-red-700",
};

export default function ParticipantsClient() {
  const router = useRouter();
  const [checkedSession, setCheckedSession] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<ParticipantRow[] | null>(null);
  const [invites, setInvites] = useState<InviteRow[] | null>(null);
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

    const [p, i] = await Promise.all([
      supabase.rpc("staff_list_participants"),
      supabase.rpc("staff_list_invites"),
    ]);
    const failure = p.error ?? i.error;
    if (failure) {
      if (isNotAuthorizedError(failure.message)) setNotAuthorized(true);
      else setError(failure.message);
      setParticipants(null);
      setInvites(null);
    } else {
      setParticipants((p.data ?? []) as ParticipantRow[]);
      setInvites((i.data ?? []) as InviteRow[]);
    }
    setLoading(false);
  }, [router]);

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
          <Link
            href="/doctor"
            className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-lilac transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to patients
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {!checkedSession || loading ? (
          <div className="flex items-center justify-center py-24 text-ink/50">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading…
          </div>
        ) : notAuthorized ? (
          <Notice title="Not authorized">
            This account is not on the clinic staff list.
          </Notice>
        ) : error ? (
          <Notice title="Could not load">{error}</Notice>
        ) : (
          <>
            <InvitesPanel invites={invites ?? []} onChanged={load} />
            <ParticipantsPanel rows={participants ?? []} onChanged={load} />
          </>
        )}
      </div>
    </main>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 flex gap-3">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <div>
        <div className="font-medium">{title}</div>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ Invite codes ------------------------------- */

function InvitesPanel({ invites, onChanged }: { invites: InviteRow[]; onChanged: () => void }) {
  const [cohort, setCohort] = useState<Exclude<Cohort, "unknown">>("clinic_patient");
  const [clinicRef, setClinicRef] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresDays, setExpiresDays] = useState(30);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [minted, setMinted] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const mint = useCallback(async () => {
    setBusy(true);
    setError(null);
    const expiresAt = new Date(Date.now() + expiresDays * 86_400_000).toISOString();
    const { data, error: rpcError } = await supabase.rpc("staff_create_invite", {
      p_cohort: cohort,
      p_clinic_ref: clinicRef.trim() || null,
      p_max_uses: maxUses,
      p_expires_at: expiresAt,
      p_note: note.trim() || null,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setMinted(String(data));
    onChanged();
  }, [cohort, clinicRef, maxUses, expiresDays, note, onChanged]);

  const revoke = useCallback(
    async (id: string) => {
      if (!window.confirm("Revoke this code? Anyone who has not used it yet will be unable to.")) return;
      const { error: rpcError } = await supabase.rpc("staff_revoke_invite", { p_id: id });
      if (rpcError) setError(rpcError.message);
      onChanged();
    },
    [onChanged]
  );

  const copy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable — the code is on screen */
    }
  }, []);

  const visible = useMemo(
    () => (showAll ? invites : invites.filter((i) => i.status === "active")),
    [invites, showAll]
  );

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-violet" />
        <h2 className="font-display text-xl text-ink">Invite codes</h2>
      </div>
      <p className="text-sm text-ink/60 mb-4 max-w-3xl">
        A code puts a new account in the right cohort the moment the patient signs up. Give
        each clinic patient their own code (one use). An account created without a code
        stays <em>Unassigned</em> and is not part of any export until you assign it below.
      </p>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs text-ink/60">
            Cohort
            <select
              value={cohort}
              onChange={(e) => setCohort(e.target.value as Exclude<Cohort, "unknown">)}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            >
              {MINTABLE.map((c) => (
                <option key={c} value={c}>
                  {cohortLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink/60">
            Clinic reference <span className="text-ink/40">(optional, no names)</span>
            <input
              value={clinicRef}
              onChange={(e) => setClinicRef(e.target.value)}
              placeholder="e.g. file 4821"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-ink/60">
            Uses
            <input
              type="number"
              min={1}
              max={500}
              value={maxUses}
              onChange={(e) => setMaxUses(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-ink/60">
            Expires in (days)
            <input
              type="number"
              min={1}
              max={365}
              value={expiresDays}
              onChange={(e) => setExpiresDays(Math.max(1, Math.min(365, Number(e.target.value) || 30)))}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-ink/60">
            Note
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. wave 1"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={mint}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2 text-sm font-medium text-white hover:bg-violet/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Create code
          </button>
          {minted && (
            <button
              onClick={() => copy(minted)}
              className="inline-flex items-center gap-2 rounded-xl border border-violet/30 bg-violet/5 px-4 py-2 font-mono text-lg tracking-[0.2em] text-ink"
              title="Copy"
            >
              {minted}
              {copied === minted ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-ink/50" />
              )}
            </button>
          )}
          {error && <span className="text-sm text-red-700">{error}</span>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-ink/50">
          {showAll ? "All codes" : "Active codes"} · {visible.length}
        </span>
        <button onClick={() => setShowAll((v) => !v)} className="text-xs text-violet hover:underline">
          {showAll ? "Show active only" : "Show all"}
        </button>
      </div>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Cohort</th>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium text-center">Used</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-ink/50">
                  No codes yet.
                </td>
              </tr>
            )}
            {visible.map((i) => (
              <tr key={i.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  <button
                    onClick={() => copy(i.code)}
                    className="inline-flex items-center gap-2 font-mono tracking-[0.15em] text-ink hover:text-violet"
                    title="Copy"
                  >
                    {i.code}
                    {copied === i.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-ink/40" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${COHORT_CLASS[i.cohort]}`}>
                    {cohortLabel(i.cohort)}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/70">{i.clinic_ref || "—"}</td>
                <td className="px-4 py-3 text-center text-ink/80">
                  {i.used_count}/{i.max_uses}
                </td>
                <td className="px-4 py-3 text-ink/70">{i.expires_at ? fmtDate(i.expires_at) : "never"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[i.status]}`}>
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/60">{i.note || ""}</td>
                <td className="px-4 py-3 text-right">
                  {i.status === "active" && (
                    <button
                      onClick={() => revoke(i.id)}
                      className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-red-700"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------ Participants ------------------------------- */

function ParticipantsPanel({ rows, onChanged }: { rows: ParticipantRow[]; onChanged: () => void }) {
  const [filter, setFilter] = useState<"all" | Cohort>("all");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setCohort = useCallback(
    async (row: ParticipantRow, cohort: Cohort) => {
      if (cohort === row.cohort) return;
      const ref =
        cohort === "clinic_patient" && !row.clinic_ref
          ? window.prompt("Clinic reference for this patient (optional, no names):", "") ?? ""
          : "";
      setPending(row.user_id);
      setError(null);
      const { error: rpcError } = await supabase.rpc("staff_set_cohort", {
        p_user_id: row.user_id,
        p_cohort: cohort,
        p_clinic_ref: ref.trim() || null,
      });
      setPending(null);
      if (rpcError) setError(rpcError.message);
      onChanged();
    },
    [onChanged]
  );

  const counts = useMemo(() => {
    const c: Record<Cohort, number> = { clinic_patient: 0, friend_family: 0, internal_tester: 0, unknown: 0 };
    for (const r of rows) c[r.cohort] += 1;
    return c;
  }, [rows]);

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.cohort === filter)),
    [rows, filter]
  );

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-violet" />
        <h2 className="font-display text-xl text-ink">Participants</h2>
      </div>
      <p className="text-sm text-ink/60 mb-4 max-w-3xl">
        Every account, unassigned first. Only <strong>Clinic</strong> and{" "}
        <strong>Friends &amp; family</strong> appear on the patient list and in the ML export.{" "}
        <strong>Internal</strong> and <strong>Unassigned</strong> never do.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(["all", ...COHORTS] as ("all" | Cohort)[]).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === c ? "border-violet bg-violet text-white" : "border-line bg-white text-ink/70 hover:bg-lilac"
            }`}
          >
            {c === "all" ? `All · ${rows.length}` : `${cohortLabel(c)} · ${counts[c]}`}
          </button>
        ))}
        {error && <span className="text-sm text-red-700 ml-2">{error}</span>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Cohort</th>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last log</th>
              <th className="px-4 py-3 font-medium text-center">Days logged</th>
              <th className="px-4 py-3 font-medium text-center">Health</th>
              <th className="px-4 py-3 font-medium">Consent</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-ink/50">
                  Nobody here.
                </td>
              </tr>
            )}
            {visible.map((r) => (
              <tr key={r.user_id} className="border-b border-line/60 last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{r.name || r.email || "Unknown"}</div>
                  {r.name && r.email && <div className="text-xs text-ink/50">{r.email}</div>}
                  {r.is_staff && (
                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      staff
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.cohort}
                    disabled={r.is_staff || pending === r.user_id}
                    onChange={(e) => setCohort(r, e.target.value as Cohort)}
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${COHORT_CLASS[r.cohort]} disabled:opacity-60`}
                    title={r.is_staff ? "Staff accounts are always internal" : "Change cohort"}
                  >
                    {COHORTS.map((c) => (
                      <option key={c} value={c}>
                        {cohortLabel(c)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-ink/70">{r.clinic_ref || "—"}</td>
                <td className="px-4 py-3 text-ink/70">{fmtDate(r.member_since)}</td>
                <td className="px-4 py-3 text-ink/70">{fmtDate(r.last_log_date)}</td>
                <td className="px-4 py-3 text-center text-ink/80">{r.log_days ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  {r.has_healthkit ? <Check className="inline w-4 h-4 text-emerald-600" /> : <span className="text-ink/40">—</span>}
                </td>
                <td className="px-4 py-3 text-ink/70">{r.consent_version || <span className="text-amber-700">none</span>}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/60">{r.invite_code || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/doctor/patient?id=${r.user_id}`} className="text-xs text-violet hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

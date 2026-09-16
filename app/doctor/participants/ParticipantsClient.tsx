"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  KeyRound,
  Loader2,
  Search,
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
  type DuplicateRow,
  type InviteRow,
  type ParticipantRow,
} from "@/lib/doctorTypes";
import { downloadCSV, toCSV } from "@/lib/csv";

/*
 * Participants & invite codes.
 *
 * Sized for a 200-patient pilot rather than a handful of testers, which means
 * the list RPCs are now bounded and searchable SERVER-side (migration 038):
 * they take search / cohort / limit / offset and report `total_count`. The
 * previous version fetched every participant and every code ever minted, then
 * re-fetched BOTH after every single-row edit — and PostgREST silently caps a
 * response at max_rows, so the old approach would have started losing rows
 * with no error at all.
 *
 * Cohort decides who reaches the clinic roster and the ML export. Everything
 * here is therefore a data-integrity surface, not an admin convenience.
 */

const PAGE_SIZE = 50;

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

/** Debounce a fast-changing value so typing does not fire one RPC per keystroke. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export default function ParticipantsClient() {
  const router = useRouter();
  const [checkedSession, setCheckedSession] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [invites, setInvites] = useState<InviteRow[] | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);

  const loadSecondary = useCallback(async () => {
    const [i, d] = await Promise.all([
      supabase.rpc("staff_list_invites", { p_limit: 200 }),
      supabase.rpc("staff_duplicate_candidates"),
    ]);
    if (i.error) {
      if (isNotAuthorizedError(i.error.message)) setNotAuthorized(true);
      else setError(i.error.message);
    } else {
      setInvites((i.data ?? []) as InviteRow[]);
    }
    // The detector is advisory; a missing function must not break the page.
    if (!d.error) setDuplicates((d.data ?? []) as DuplicateRow[]);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/doctor");
        return;
      }
      setCheckedSession(true);
      await loadSecondary();
      setLoading(false);
    })();
  }, [router, loadSecondary]);

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
          <Notice title="Not authorized">This account is not on the clinic staff list.</Notice>
        ) : error ? (
          <Notice title="Could not load">{error}</Notice>
        ) : (
          <>
            {duplicates.length > 0 && <DuplicateBanner rows={duplicates} />}
            <InvitesPanel invites={invites ?? []} onChanged={loadSecondary} />
            <ParticipantsPanel onCohortChanged={loadSecondary} />
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

/* ---------------------------- Duplicate warning --------------------------- */

/**
 * A split record means half a patient's history is invisible to their doctor
 * and to the avatar. There is no safe automatic merge, so this only ever
 * reports: the fix is to set the empty duplicate to Internal so it never
 * exports, and tell the patient which button to use.
 */
function DuplicateBanner({ rows }: { rows: DuplicateRow[] }) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="w-4 h-4" />
        {rows.length} possible duplicate {rows.length === 1 ? "record" : "records"}
      </div>
      <ul className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <li key={`${r.kind}:${r.key}`} className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-xs">{r.key}</span>
            <span className="text-amber-800/80">{r.detail}</span>
            <span className="text-xs text-amber-800/70">
              ({r.emails.join(", ")} · {r.cohorts.join(", ")})
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-800/80">
        Do not merge them. Set the empty one to <strong>Internal</strong> so it never reaches the
        dataset, and tell the patient which sign-in to use from now on.
      </p>
    </div>
  );
}

/* ------------------------------ Invite codes ------------------------------ */

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
    // The reference belongs to one patient; keeping it would silently stamp the
    // next code with the previous patient's file number.
    setClinicRef("");
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

  const exportCodes = useCallback(() => {
    const csv = toCSV<InviteRow>(
      [
        { key: "code", label: "Code" },
        { key: "cohort", label: "Cohort" },
        { key: "clinic_ref", label: "Clinic reference" },
        { key: "status", label: "Status" },
        { key: "used_count", label: "Used" },
        { key: "max_uses", label: "Max uses" },
        { key: "expires_at", label: "Expires" },
        { key: "note", label: "Note" },
      ],
      invites
    );
    downloadCSV(`invite-codes-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }, [invites]);

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
        A code puts a new account in the right cohort the moment the patient signs up. For a
        send-out, mint ONE code with as many uses as patients and put it in the message; per-patient
        codes only earn their keep when you need each patient&apos;s file reference recorded. An
        account created without a code stays <em>Unassigned</em> and reaches no export until you
        assign it below.
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
        <div className="flex items-center gap-3">
          <button onClick={exportCodes} className="inline-flex items-center gap-1.5 text-xs text-violet hover:underline">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button onClick={() => setShowAll((v) => !v)} className="text-xs text-violet hover:underline">
            {showAll ? "Show active only" : "Show all"}
          </button>
        </div>
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

/* ------------------------------ Participants ------------------------------ */

function ParticipantsPanel({ onCohortChanged }: { onCohortChanged: () => void }) {
  const [rows, setRows] = useState<ParticipantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [cohortFilter, setCohortFilter] = useState<"all" | Cohort>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Guards against an older, slower response overwriting a newer one when the
  // operator types quickly.
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("staff_list_participants", {
      p_search: debouncedSearch.trim() || null,
      p_cohort: cohortFilter === "all" ? null : cohortFilter,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    });
    if (seq !== requestSeq.current) return;
    if (rpcError) {
      setError(rpcError.message);
      setRows([]);
      setTotal(0);
    } else {
      const list = (data ?? []) as ParticipantRow[];
      setError(null);
      setRows(list);
      setTotal(list.length > 0 ? Number(list[0].total_count) : 0);
    }
    setLoading(false);
  }, [debouncedSearch, cohortFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  // A changed filter or search invalidates the page index.
  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [debouncedSearch, cohortFilter]);

  const setCohort = useCallback(
    async (row: ParticipantRow, cohort: Cohort) => {
      if (cohort === row.cohort) return;
      const ref =
        cohort === "clinic_patient" && !row.clinic_ref
          ? window.prompt("Clinic reference for this patient (optional, no names):", "") ?? ""
          : "";
      // Optimistic: the old version re-fetched BOTH unbounded lists after every
      // single row, which at 200 patients made a promote session hundreds of
      // full-table queries.
      setRows((prev) => prev.map((r) => (r.user_id === row.user_id ? { ...r, cohort } : r)));
      const { error: rpcError } = await supabase.rpc("staff_set_cohort", {
        p_user_id: row.user_id,
        p_cohort: cohort,
        p_clinic_ref: ref.trim() || null,
      });
      if (rpcError) {
        setError(rpcError.message);
        load(); // roll back to server truth
        return;
      }
      onCohortChanged();
    },
    [load, onCohortChanged]
  );

  const bulkPromote = useCallback(
    async (cohort: Cohort) => {
      if (selected.size === 0) return;
      if (!window.confirm(`Set ${selected.size} ${selected.size === 1 ? "account" : "accounts"} to ${cohortLabel(cohort)}?`))
        return;
      setBulkBusy(true);
      const { error: rpcError } = await supabase.rpc("staff_set_cohort_bulk", {
        p_user_ids: Array.from(selected),
        p_cohort: cohort,
        p_clinic_ref: null,
      });
      setBulkBusy(false);
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      setSelected(new Set());
      load();
      onCohortChanged();
    },
    [selected, load, onCohortChanged]
  );

  const exportCSV = useCallback(() => {
    const csv = toCSV<ParticipantRow>(
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "cohort", label: "Cohort" },
        { key: "clinic_ref", label: "Clinic reference" },
        { key: "platform", label: "Platform" },
        { key: "member_since", label: "Joined" },
        { key: "enrolled_at", label: "Enrolled" },
        { key: "consent_version", label: "Consent" },
        { key: "last_log_date", label: "Last log" },
        { key: "log_days", label: "Days logged" },
        { key: "has_healthkit", label: "Health data" },
        { key: "invite_code", label: "Code" },
      ],
      rows
    );
    downloadCSV(`participants-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }, [rows]);

  const selectableOnPage = useMemo(() => rows.filter((r) => !r.is_staff), [rows]);
  const allSelected = selectableOnPage.length > 0 && selectableOnPage.every((r) => selected.has(r.user_id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) selectableOnPage.forEach((r) => next.delete(r.user_id));
      else selectableOnPage.forEach((r) => next.add(r.user_id));
      return next;
    });
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, clinic reference or code…"
            className="w-full rounded-full border border-line bg-white pl-9 pr-4 py-2 text-sm text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
          />
        </div>
        {(["all", ...COHORTS] as ("all" | Cohort)[]).map((c) => (
          <button
            key={c}
            onClick={() => setCohortFilter(c)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              cohortFilter === c ? "border-violet bg-violet text-white" : "border-line bg-white text-ink/70 hover:bg-lilac"
            }`}
          >
            {c === "all" ? "All" : cohortLabel(c)}
          </button>
        ))}
        <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-ink/70 hover:bg-lilac">
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-violet/30 bg-violet/5 px-4 py-3 text-sm">
          <span className="font-medium text-ink">{selected.size} selected</span>
          <span className="text-ink/50">Set to:</span>
          {COHORTS.map((c) => (
            <button
              key={c}
              disabled={bulkBusy}
              onClick={() => bulkPromote(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${COHORT_CLASS[c]}`}
            >
              {cohortLabel(c)}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-ink/50 hover:underline">
            Clear
          </button>
        </div>
      )}

      {error && <div className="mb-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 w-8">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all on this page" />
              </th>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Cohort</th>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last log</th>
              <th className="px-4 py-3 font-medium text-center">Days</th>
              <th className="px-4 py-3 font-medium text-center">Health</th>
              <th className="px-4 py-3 font-medium">Consent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-ink/50">
                  <Loader2 className="inline w-4 h-4 animate-spin mr-2" />
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-ink/50">
                  Nobody matches.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.user_id} className="border-b border-line/60 last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    {!r.is_staff && (
                      <input
                        type="checkbox"
                        checked={selected.has(r.user_id)}
                        onChange={() =>
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(r.user_id)) next.delete(r.user_id);
                            else next.add(r.user_id);
                            return next;
                          })
                        }
                        aria-label={`Select ${r.email ?? r.user_id}`}
                      />
                    )}
                  </td>
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
                      disabled={r.is_staff}
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
                  <td className="px-4 py-3 text-ink/70">{r.platform ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{fmtDate(r.member_since)}</td>
                  <td className="px-4 py-3 text-ink/70">{fmtDate(r.last_log_date)}</td>
                  <td className="px-4 py-3 text-center text-ink/80">{r.log_days ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {r.has_healthkit ? (
                      <Check className="inline w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {r.consent_version || <span className="text-amber-700">none</span>}
                  </td>
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

      <div className="mt-3 flex items-center justify-between text-sm text-ink/60">
        <span>
          {total} {total === 1 ? "account" : "accounts"}
          {pages > 1 && ` · page ${page + 1} of ${pages}`}
        </span>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

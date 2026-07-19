"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import rawContent from "@/lib/clinicalReviewContent.json";
import {
  CheckCircle2,
  PencilLine,
  Loader2,
  Stethoscope,
  ShieldAlert,
  Send,
  Eraser,
  Check,
  Mail,
} from "lucide-react";

/* ------------------------------- content types ------------------------------ */
type Block =
  | { kind: "heading"; he: string; en: string }
  | { kind: "text"; he: string; en: string }
  | { kind: "en"; en: string }
  | { kind: "note"; he?: string; en?: string }
  | { kind: "list"; items: { he: string; en: string; mark?: "correct" | "preferred" }[] };
type Unit = { id: string; titleHe: string; titleEn: string; blocks: Block[] };
type Section = { id: string; titleHe: string; titleEn: string; units: Unit[] };
const CONTENT = rawContent as unknown as { unitCount: number; sections: Section[] };

const REVIEWER_DEFAULT_NAME = "ד״ר פיוטר מליקוב";

type Verdict = "approved" | "needs_change";
type ItemState = { verdict?: Verdict; note?: string };

/* ================================ entry ==================================== */
export default function ClinicalReviewClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Confirm the signed-in account is on the clinic_staff allowlist.
  useEffect(() => {
    if (!session) {
      setAuthorized(null);
      return;
    }
    let active = true;
    supabase.rpc("review_is_authorized").then(({ data, error }) => {
      if (!active) return;
      setAuthorized(!error && data === true);
    });
    return () => {
      active = false;
    };
  }, [session]);

  if (sessionLoading) return <Splash text="טוען…" />;
  if (!session) return <LoginGate />;
  if (authorized === null) return <Splash text="בודק הרשאות…" />;
  if (!authorized) return <NotAuthorized email={session.user.email ?? ""} />;
  return <Review session={session} />;
}

/* ------------------------------- small views -------------------------------- */
function Splash({ text }: { text: string }) {
  return (
    <main dir="rtl" className="min-h-screen bg-mist flex flex-col items-center justify-center gap-3 text-ink">
      <Loader2 className="w-7 h-7 animate-spin text-violet" />
      <p className="text-base text-ink-soft">{text}</p>
    </main>
  );
}

function LoginGate() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const redirect =
      typeof window !== "undefined" ? `${window.location.origin}/clinical-review` : undefined;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirect },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-mist flex items-center justify-center px-6 text-ink">
      <div className="w-full max-w-md bg-paper rounded-3xl border border-line p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-lilac flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-violet" />
          </div>
          <div>
            <h1 className="font-display text-2xl leading-tight">סקירת תוכן קליני</h1>
            <p className="text-sm text-ink-soft">MyGraine · לרופא/ה בלבד</p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-lilac/60 border border-line p-6 text-center">
            <Mail className="w-8 h-8 text-violet mx-auto mb-3" />
            <p className="text-lg font-medium">שלחנו לך קישור כניסה למייל</p>
            <p className="text-base text-ink-soft mt-2">
              פתח/י את המייל והקש/י על הקישור — הוא יכניס אותך אוטומטית, בלי סיסמה.
            </p>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <p className="text-base text-ink-soft">
              הכנס/י את כתובת המייל שלך ונשלח לך קישור כניסה בהקשה אחת — אין צורך בסיסמה.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@clinic.com"
              dir="ltr"
              className="w-full rounded-2xl border border-line bg-mist px-4 py-3.5 text-lg text-ink text-left outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
            />
            {error && (
              <div className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-base text-red-700">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-ink text-paper py-4 text-lg font-medium hover:bg-violet transition-colors disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
              שלחו לי קישור כניסה
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function NotAuthorized({ email }: { email: string }) {
  return (
    <main dir="rtl" className="min-h-screen bg-mist flex items-center justify-center px-6 text-ink">
      <div className="w-full max-w-md bg-paper rounded-3xl border border-line p-8 text-center shadow-sm">
        <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-4" />
        <h1 className="font-display text-2xl mb-2">אין הרשאה</h1>
        <p className="text-base text-ink-soft">
          החשבון <span dir="ltr">{email}</span> אינו מורשה לסקירה. פנה/י לצוות MyGraine כדי לקבל גישה.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 rounded-2xl border border-line px-5 py-2.5 text-base hover:bg-mist"
        >
          התנתקות
        </button>
      </div>
    </main>
  );
}

/* ================================ review =================================== */
function Review({ session }: { session: Session }) {
  const reviewerId = session.user.id;
  const flatUnits = useMemo(
    () => CONTENT.sections.flatMap((s) => s.units.map((u) => ({ unit: u, sectionId: s.id }))),
    []
  );
  const total = flatUnits.length;

  const [items, setItems] = useState<Record<string, ItemState>>({});
  const [loaded, setLoaded] = useState(false);
  const [savingCount, setSavingCount] = useState(0);
  const [done, setDone] = useState(false);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Hydrate saved answers.
  useEffect(() => {
    let active = true;
    supabase
      .from("clinical_review_items")
      .select("item_id,verdict,note")
      .then(({ data }) => {
        if (!active) return;
        const map: Record<string, ItemState> = {};
        for (const row of data ?? []) map[row.item_id] = { verdict: row.verdict ?? undefined, note: row.note ?? undefined };
        setItems(map);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const reviewedCount = useMemo(
    () => Object.values(items).filter((i) => i.verdict).length,
    [items]
  );

  const saveItem = async (itemId: string, sectionId: string, next: ItemState) => {
    setSavingCount((c) => c + 1);
    try {
      await supabase.from("clinical_review_items").upsert(
        {
          reviewer_id: reviewerId,
          item_id: itemId,
          section: sectionId,
          verdict: next.verdict ?? null,
          note: next.note ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "reviewer_id,item_id" }
      );
    } finally {
      setSavingCount((c) => Math.max(0, c - 1));
    }
  };

  const setVerdict = (itemId: string, sectionId: string, verdict: Verdict) => {
    setItems((prev) => {
      const next = { ...prev[itemId], verdict };
      void saveItem(itemId, sectionId, next);
      return { ...prev, [itemId]: next };
    });
  };

  const setNote = (itemId: string, sectionId: string, note: string) => {
    setItems((prev) => {
      const next = { ...prev[itemId], note };
      clearTimeout(noteTimers.current[itemId]);
      noteTimers.current[itemId] = setTimeout(() => saveItem(itemId, sectionId, next), 700);
      return { ...prev, [itemId]: next };
    });
  };

  if (!loaded) return <Splash text="טוען את הסקירה שלך…" />;
  if (done) return <ThankYou />;

  const pct = Math.round((reviewedCount / total) * 100);

  return (
    <main dir="rtl" className="min-h-screen bg-mist text-ink pb-24">
      {/* sticky progress header */}
      <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur border-b border-line">
        <div className="max-w-3xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-lg sm:text-xl">סקירת תוכן קליני</h1>
            <span className="text-sm text-ink-soft flex items-center gap-1.5">
              {savingCount > 0 ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> שומר…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> נשמר
                </>
              )}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-violet transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-medium tabular-nums">
              {reviewedCount} / {total}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5">
        {/* intro */}
        <section className="mt-6 mb-4 rounded-2xl bg-lilac/60 border border-line p-5">
          <p className="text-lg leading-relaxed">
            שלום ד״ר מליקוב, ותודה. להלן התוכן שהמטופלים יראו (בעברית, עם אנגלית לעיון). על כל פריט,
            הקש/י <b>מאושר</b> אם הוא תקין, או <b>צריך תיקון</b> וכתוב/כתבי מה לשנות. הכול נשמר אוטומטית —
            אפשר לעצור ולחזור בכל עת. בסוף חותמים ושולחים.
          </p>
        </section>

        {CONTENT.sections.map((section) => (
          <div key={section.id} className="mt-8">
            <h2 className="font-display text-2xl mb-1">{section.titleHe}</h2>
            <p className="text-sm text-ink-soft mb-4" dir="ltr" style={{ textAlign: "left" }}>
              {section.titleEn}
            </p>
            {section.units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                sectionId={section.id}
                state={items[unit.id] ?? {}}
                onVerdict={(v) => setVerdict(unit.id, section.id, v)}
                onNote={(n) => setNote(unit.id, section.id, n)}
              />
            ))}
          </div>
        ))}

        {/* sign-off */}
        <SignOff
          reviewerId={reviewerId}
          items={items}
          total={total}
          reviewedCount={reviewedCount}
          onDone={() => setDone(true)}
        />
      </div>
    </main>
  );
}

/* ------------------------------- unit card ---------------------------------- */
function UnitCard({
  unit,
  sectionId,
  state,
  onVerdict,
  onNote,
}: {
  unit: Unit;
  sectionId: string;
  state: ItemState;
  onVerdict: (v: Verdict) => void;
  onNote: (n: string) => void;
}) {
  void sectionId;
  const approved = state.verdict === "approved";
  const needs = state.verdict === "needs_change";
  return (
    <div
      className={`rounded-3xl border bg-paper p-6 mb-4 shadow-sm transition-colors ${
        approved ? "border-emerald-300" : needs ? "border-amber-300" : "border-line"
      }`}
    >
      <h3 className="font-display text-xl mb-1">{unit.titleHe}</h3>
      <p className="text-sm text-ink-soft mb-4" dir="ltr" style={{ textAlign: "left" }}>
        {unit.titleEn}
      </p>

      <div className="space-y-3">
        {unit.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>

      {/* verdict buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => onVerdict("approved")}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-lg font-medium border-2 transition-colors ${
            approved
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-paper border-line text-ink hover:border-emerald-400"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" /> מאושר
        </button>
        <button
          onClick={() => onVerdict("needs_change")}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-lg font-medium border-2 transition-colors ${
            needs
              ? "bg-amber-500 border-amber-500 text-white"
              : "bg-paper border-line text-ink hover:border-amber-400"
          }`}
        >
          <PencilLine className="w-5 h-5" /> צריך תיקון
        </button>
      </div>

      {needs && (
        <textarea
          value={state.note ?? ""}
          onChange={(e) => onNote(e.target.value)}
          placeholder="מה צריך לשנות? כתוב/כתבי כאן…"
          rows={3}
          className="mt-3 w-full rounded-2xl border border-line bg-mist px-4 py-3 text-base outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
        />
      )}
    </div>
  );
}

/* ------------------------------- block view --------------------------------- */
function BlockView({ block }: { block: Block }) {
  if (block.kind === "heading")
    return (
      <p className="text-xs font-bold uppercase tracking-wide text-violet mt-4">
        {block.he}
        <span className="text-ink-soft font-normal"> · {block.en}</span>
      </p>
    );
  if (block.kind === "text")
    return (
      <div>
        <p className="text-lg leading-relaxed">{block.he}</p>
        <p className="text-sm text-ink-soft mt-0.5" dir="ltr" style={{ textAlign: "left" }}>
          {block.en}
        </p>
      </div>
    );
  if (block.kind === "en")
    return (
      <p className="text-base text-ink-soft leading-relaxed" dir="ltr" style={{ textAlign: "left" }}>
        {block.en}
      </p>
    );
  if (block.kind === "note")
    return (
      <div className="rounded-xl bg-mist px-3.5 py-2.5">
        {block.he && <p className="text-sm">{block.he}</p>}
        {block.en && (
          <p className="text-xs text-ink-soft mt-0.5" dir="ltr" style={{ textAlign: "left" }}>
            {block.en}
          </p>
        )}
      </div>
    );
  // list
  return (
    <ul className="space-y-1.5">
      {block.items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ink-soft shrink-0" />
          <div className="flex-1">
            <span className="text-base">{it.he}</span>
            {it.mark && (
              <span
                className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold align-middle ${
                  it.mark === "correct" ? "bg-emerald-100 text-emerald-700" : "bg-violet/10 text-violet"
                }`}
              >
                {it.mark === "correct" ? "✓ התשובה הנכונה" : "◆ המועדפת"}
              </span>
            )}
            <span className="block text-xs text-ink-soft" dir="ltr" style={{ textAlign: "left" }}>
              {it.en}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------- sign-off ----------------------------------- */
function SignOff({
  reviewerId,
  items,
  total,
  reviewedCount,
  onDone,
}: {
  reviewerId: string;
  items: Record<string, ItemState>;
  total: number;
  reviewedCount: number;
  onDone: () => void;
}) {
  const [name, setName] = useState(REVIEWER_DEFAULT_NAME);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  const approved = Object.values(items).filter((i) => i.verdict === "approved").length;
  const needsChange = Object.values(items).filter((i) => i.verdict === "needs_change").length;
  const allReviewed = reviewedCount >= total;

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0e0e12";
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    hasInk.current = true;
  };
  const end = () => {
    drawing.current = false;
  };
  const clearSig = () => {
    const c = canvasRef.current;
    if (c) c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    hasInk.current = false;
  };

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("נא להזין שם.");
      return;
    }
    setBusy(true);
    try {
      const signature = hasInk.current ? canvasRef.current!.toDataURL("image/png") : null;
      const { error: err } = await supabase.from("clinical_review_signoff").upsert(
        {
          reviewer_id: reviewerId,
          full_name: name.trim(),
          signature,
          summary: { approved, needsChange, total },
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "reviewer_id" }
      );
      if (err) throw err;
      onDone();
    } catch (e) {
      setError((e as Error).message ?? "שגיאה בשליחה. נסה/י שוב.");
      setBusy(false);
    }
  };

  return (
    <section className="mt-12 rounded-3xl border border-line bg-paper p-6 sm:p-8 shadow-sm">
      <h2 className="font-display text-2xl mb-2">סיום וחתימה</h2>
      <p className="text-base text-ink-soft mb-4">
        אישרת {approved} · סימנת לתיקון {needsChange} · מתוך {total} פריטים.
      </p>
      {!allReviewed && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-base text-amber-800 mb-4">
          נותרו {total - reviewedCount} פריטים שעדיין לא נבדקו — אפשר לחתום גם כך, אך מומלץ לעבור על כולם.
        </div>
      )}

      <label className="block text-base font-medium mb-1.5">שם מלא</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-2xl border border-line bg-mist px-4 py-3 text-lg outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
      />

      <label className="block text-base font-medium mt-4 mb-1.5">חתימה (חתום/חתמי כאן באצבע)</label>
      <div className="rounded-2xl border-2 border-dashed border-line bg-mist overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={180}
          className="w-full touch-none"
          style={{ height: 180 }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <button onClick={clearSig} className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <Eraser className="w-4 h-4" /> נקה חתימה
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-base text-red-700">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={submit}
        disabled={busy}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-ink text-paper py-4 text-lg font-medium hover:bg-violet transition-colors disabled:opacity-60"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        סיום ושליחה
      </button>
    </section>
  );
}

function ThankYou() {
  return (
    <main dir="rtl" className="min-h-screen bg-mist flex items-center justify-center px-6 text-ink">
      <div className="w-full max-w-md bg-paper rounded-3xl border border-line p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="font-display text-2xl mb-2">תודה רבה!</h1>
        <p className="text-base text-ink-soft">
          הסקירה שלך נשלחה ונשמרה. צוות MyGraine יקבל את ההערות שלך. אפשר לסגור את החלון.
        </p>
        <button
          onClick={() => window.print()}
          className="mt-6 rounded-2xl border border-line px-5 py-2.5 text-base hover:bg-mist"
        >
          הדפסה / שמירת עותק
        </button>
      </div>
    </main>
  );
}

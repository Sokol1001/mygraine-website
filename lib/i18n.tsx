"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Lang = "en" | "he";

const STORAGE_KEY = "mygraine-lang";
export const DEFAULT_LANG: Lang = "en";

/* ------------------------------ Dictionaries ------------------------------ */
// Source of truth = the original Hebrew site copy. English is a faithful
// translation of it. No invented marketing copy.

const en = {
  common: { cta: "I want the app" },
  meta: {
    title: "Mygraine AI — an expert migraine neurologist in your pocket",
    description:
      "A self-care program for migraine, developed by an expert neurologist and personalized for you with AI.",
  },
  hero: {
    titlePrefix: "An expert migraine neurologist ",
    titleHighlight: "in your pocket!",
    subtitle:
      "A self-care program for migraine, developed by an expert neurologist and personalized for you with AI. The most convenient, the smartest, the most effective.",
    phoneAlt: "The Mygraine AI app screen",
  },
  features: {
    headingPrefix: "What does the ",
    headingSuffix: " app do for you?",
    benefits: [
      "Learns and understands your migraine attacks",
      "Builds a treatment plan tailored personally to you",
      "Helps prevent your next attack through ongoing guidance",
    ],
    alts: {
      avatar: "Mygraine AI avatar screen",
      track: "Mygraine AI migraine tracking screen",
      protocol: "Mygraine AI care plan screen",
      resilience: "Mygraine AI resilience score screen",
      education: "Mygraine AI knowledge hub screen",
    },
  },
  why: {
    headingPrefix: "Why ",
    headingSuffix: "?",
    reasons: [
      {
        title: "As close as it gets to a real doctor",
        description:
          "Diagnosis happens naturally, in a conversation with a doctor-like avatar, based on the clinical assessment of a real neurologist.",
      },
      {
        title: "Developed with migraine experts and patients",
        description:
          "The app's content is based on the knowledge and professional experience of neurologists and researchers specializing in migraine.",
      },
      {
        title: "Noticeable improvement",
        description:
          "Once the app learns you, it can anticipate your migraine attacks in advance and guide you accordingly — helping you avoid them or significantly reduce their intensity.",
      },
    ],
  },
  waitlist: {
    headingPrefix: "Sign up and get ",
    headingHighlight: "early access",
    headingSuffix: " to download the app",
    subtitle:
      "Leave your details and be the first to know the moment the app is available to download:",
    successTitle: "You're on the list!",
    successBody: "We'll let you know the moment the app is ready to download.",
    nameLabel: "Name:",
    emailLabel: "Email:",
    submit: "Notify me the moment the app is available!",
    error: "Something went wrong, please try again.",
  },
};

export type Dict = typeof en;

const he: Dict = {
  common: { cta: "אני רוצה את האפליקציה" },
  meta: {
    title: "Mygraine AI — נוירולוג מומחה למיגרנה אצלך בכיס",
    description:
      "תוכנית טיפול עצמי למיגרנה שפותחה על ידי נוירולוג מומחה ומותאמת עבורך אישית באמצעות בינה מלאכותית.",
  },
  hero: {
    titlePrefix: "נוירולוג מומחה למיגרנה ",
    titleHighlight: "אצלך בכיס!",
    subtitle:
      "תוכנית טיפול עצמי למיגרנה שפותחה על ידי נוירולוג מומחה ומתאמת עבורך אישית באמצעות בינה מלאכותית. הכי נוח, הכי חכם, הכי יעיל.",
    phoneAlt: "מסך האפליקציה Mygraine AI",
  },
  features: {
    headingPrefix: "מה עושה עבורך אפליקציית ",
    headingSuffix: "?",
    benefits: [
      "לומדת ומבינה את התקפי המיגרנה שלך",
      "מתאימה לך תוכנית טיפולית שנתפרה עבורך באופן אישי",
      "מסייעת למנוע את ההתקף הבא באמצעות הדרכה שוטפת",
    ],
    alts: {
      avatar: "מסך האוואטר של Mygraine AI",
      track: "מסך מעקב מיגרנות של Mygraine AI",
      protocol: "מסך תוכנית הטיפול של Mygraine AI",
      resilience: "מסך מדד החוסן של Mygraine AI",
      education: "מסך מרכז הידע של Mygraine AI",
    },
  },
  why: {
    headingPrefix: "למה דווקא ",
    headingSuffix: "?",
    reasons: [
      {
        title: "הכי קרוב לרופא אמיתי",
        description:
          "האבחון נעשה באופן טבעי בשיחה עם אוואטר דמוי רופא, ומבוסס על איבחון קליני של נוירולוג אמיתי.",
      },
      {
        title: "פותח בשיתוף מומחים ומטופלי מיגרנה",
        description:
          "התכנים של האפליקציה מבוססים על ידע וניסיון מקצועי של נוירולוגים וחוקרים מומחים בתחום המיגרנה.",
      },
      {
        title: "שיפור מורגש",
        description:
          "לאחר שהאפליקציה לומדת אותך, היא יודעת לצפות את התקפי המיגרנה שלך מראש, מנחה אותך בהתאם, ובכך מסייעת לך להימנע מהם או להפחית משמעותית את עוצמת ההתקפים.",
      },
    ],
  },
  waitlist: {
    headingPrefix: "נרשמים ומקבלים ",
    headingHighlight: "גישה מוקדמת",
    headingSuffix: " להורדת האפליקציה",
    subtitle:
      "השאירו את פרטיכם והיו הראשונים לקבל הודעה ברגע שהאפליקציה זמינה להורדה:",
    successTitle: "נרשמתם בהצלחה!",
    successBody: "נודיע לכם ברגע שאפשר להוריד את האפליקציה.",
    nameLabel: "שם:",
    emailLabel: "דואר אלקטרוני:",
    submit: "תודיעו לי ברגע שאפשר להוריד את האפליקציה!",
    error: "משהו השתבש, נסו שוב.",
  },
};

const DICTS: Record<Lang, Dict> = { en, he };

export function dir(lang: Lang): "ltr" | "rtl" {
  return lang === "he" ? "rtl" : "ltr";
}

/* -------------------------------- Context --------------------------------- */

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: Dict;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Read the stored preference after mount (avoids SSR/CSR hydration mismatch).
  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY)) as Lang | null;
    if (stored === "en" || stored === "he") setLangState(stored);
  }, []);

  // Keep <html lang/dir> and the document title in sync with the active language.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir(lang);
    document.title = DICTS[lang].meta.title;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // Ignore storage failures (private mode etc.).
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "he" : "en");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggle, t: DICTS[lang], dir: dir(lang) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

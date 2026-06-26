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

const en = {
  common: { cta: "Get the app", joinWaitlist: "Join the waitlist" },
  meta: {
    title: "Mygraine AI — an expert migraine neurologist in your pocket",
    description:
      "A self-care program for migraine, developed by an expert neurologist and personalized for you with AI.",
  },
  nav: { features: "What it does", why: "Why MyGraine", join: "Join" },
  hero: {
    lead: "An expert migraine neurologist,",
    rotating: [
      "in your pocket.",
      "that learns you.",
      "on call, 24/7.",
      "built on real medicine.",
    ],
    subtitle:
      "A self-care program for migraine, developed by an expert neurologist and personalized for you with AI. The most convenient, the smartest, the most effective.",
    phoneAlt: "The Mygraine AI app screen",
  },
  partners: { eyebrow: "Built and backed with" },
  stats: {
    items: [
      { value: "24/7", label: "An AI neurologist on call, the moment an attack hits" },
      { value: "ICHD-3", label: "Diagnosis based on the global clinical standard" },
      { value: "1:1", label: "A daily protocol personalized to you, adapting over time" },
    ],
  },
  features: {
    eyebrow: "What it does",
    heading: "A whole clinic, reimagined for your pocket.",
    cards: [
      {
        title: "AI doctor interview",
        desc: "Diagnosis happens naturally — a real conversation with a doctor-like avatar.",
        img: "/screenshots/ai-avatar.png",
        alt: "Mygraine AI avatar screen",
      },
      {
        title: "Clinical diagnosis",
        desc: "Your headache phenotype, classified to the ICHD-3 standard.",
        img: "/screenshots/diagnostic-results.png",
        alt: "Mygraine AI diagnostic results screen",
      },
      {
        title: "A personal daily protocol",
        desc: "A treatment plan tailored to you that adapts every single day.",
        img: "/screenshots/mygraine-protocol.png",
        alt: "Mygraine AI treatment plan screen",
      },
      {
        title: "Resilience score",
        desc: "See your migraine resilience — and exactly what moves it.",
        img: "/screenshots/resilience-score.png",
        alt: "Mygraine AI resilience score screen",
      },
      {
        title: "Knowledge hub",
        desc: "Learn what actually helps, straight from real specialists.",
        img: "/screenshots/education-hub.png",
        alt: "Mygraine AI knowledge hub screen",
      },
    ],
  },
  why: {
    eyebrow: "Why Mygraine AI",
    heading: "Care that finally feels personal.",
    reasons: [
      {
        title: "As close as it gets to a real doctor",
        description:
          "Diagnosis happens naturally, in a conversation with a doctor-like avatar, based on the clinical assessment of a real neurologist.",
      },
      {
        title: "Developed with migraine experts",
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
  statement: {
    text: "Your migraines are not random. Mygraine learns their pattern — and helps you stay ahead of the next one.",
  },
  waitlist: {
    eyebrow: "Early access",
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
  footer: { tagline: "An expert migraine neurologist in your pocket." },
};

export type Dict = typeof en;

const he: Dict = {
  common: { cta: "אני רוצה את האפליקציה", joinWaitlist: "הצטרפו לרשימה" },
  meta: {
    title: "Mygraine AI — נוירולוג מומחה למיגרנה אצלך בכיס",
    description:
      "תוכנית טיפול עצמי למיגרנה שפותחה על ידי נוירולוג מומחה ומותאמת עבורך אישית באמצעות בינה מלאכותית.",
  },
  nav: { features: "מה היא עושה", why: "למה MyGraine", join: "הצטרפות" },
  hero: {
    lead: "נוירולוג מומחה למיגרנה,",
    rotating: [
      "אצלך בכיס.",
      "שלומד אותך.",
      "זמין 24/7.",
      "מבוסס רפואה אמיתית.",
    ],
    subtitle:
      "תוכנית טיפול עצמי למיגרנה שפותחה על ידי נוירולוג מומחה ומתאמת עבורך אישית באמצעות בינה מלאכותית. הכי נוח, הכי חכם, הכי יעיל.",
    phoneAlt: "מסך האפליקציה Mygraine AI",
  },
  partners: { eyebrow: "נבנה ונתמך עם" },
  stats: {
    items: [
      { value: "24/7", label: "נוירולוג AI זמין ברגע שבו מתחיל התקף" },
      { value: "ICHD-3", label: "אבחון לפי הסטנדרט הקליני העולמי" },
      { value: "1:1", label: "תוכנית יומית שמותאמת אישית ומשתפרת עם הזמן" },
    ],
  },
  features: {
    eyebrow: "מה היא עושה",
    heading: "מרפאה שלמה, מותאמת לכיס שלך.",
    cards: [
      {
        title: "תשאול עם רופא AI",
        desc: "האבחון נעשה באופן טבעי — בשיחה אמיתית עם אוואטר דמוי רופא.",
        img: "/screenshots/ai-avatar.png",
        alt: "מסך האוואטר של Mygraine AI",
      },
      {
        title: "אבחון קליני",
        desc: "סוג המיגרנה שלך, מסווג לפי הסטנדרט ICHD-3.",
        img: "/screenshots/diagnostic-results.png",
        alt: "מסך תוצאות אבחון של Mygraine AI",
      },
      {
        title: "תוכנית יומית אישית",
        desc: "תוכנית טיפול שמותאמת לך ומשתנה בכל יום מחדש.",
        img: "/screenshots/mygraine-protocol.png",
        alt: "מסך תוכנית הטיפול של Mygraine AI",
      },
      {
        title: "מדד חוסן",
        desc: "ראו את חוסן המיגרנה שלכם — ומה בדיוק משפיע עליו.",
        img: "/screenshots/resilience-score.png",
        alt: "מסך מדד החוסן של Mygraine AI",
      },
      {
        title: "מרכז ידע",
        desc: "ללמוד מה באמת עוזר, ישירות ממומחים אמיתיים.",
        img: "/screenshots/education-hub.png",
        alt: "מסך מרכז הידע של Mygraine AI",
      },
    ],
  },
  why: {
    eyebrow: "למה דווקא Mygraine AI",
    heading: "טיפול שסוף סוף מרגיש אישי.",
    reasons: [
      {
        title: "הכי קרוב לרופא אמיתי",
        description:
          "האבחון נעשה באופן טבעי בשיחה עם אוואטר דמוי רופא, ומבוסס על איבחון קליני של נוירולוג אמיתי.",
      },
      {
        title: "פותח בשיתוף מומחים למיגרנה",
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
  statement: {
    text: "המיגרנות שלך אינן אקראיות. Mygraine לומדת את הדפוס שלהן — ועוזרת לך להקדים את ההתקף הבא.",
  },
  waitlist: {
    eyebrow: "גישה מוקדמת",
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
  footer: { tagline: "נוירולוג מומחה למיגרנה אצלך בכיס." },
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

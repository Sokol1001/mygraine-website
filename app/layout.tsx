import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mygraine AI — נוירולוג מומחה למיגרנה אצלך בכיס",
  description:
    "תוכנית טיפול עצמי למיגרנה שפותחה על ידי נוירולוג מומחה ומותאמת עבורך אישית באמצעות בינה מלאכותית.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;600;700&family=Heebo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

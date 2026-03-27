import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyGraine AI — AI-Powered Migraine Diagnosis & Management",
  description:
    "Get an ICHD-3 compliant migraine diagnosis through a conversational AI neurologist. Track attacks, monitor triggers, and build resilience — all from your phone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Nunito+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

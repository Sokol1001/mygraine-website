import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mygraine AI — Smart Migraine Tracking & Diagnosis",
  description:
    "Track, understand, and manage your migraines with AI-powered insights. Get accurate ICHD-3 diagnosis and personalized care.",
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

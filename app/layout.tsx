import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://burakakcakanat.com.tr"),
  title: "Burak Akçakanat | Strategic Venture Architect",
  description:
    "Premium bilingual personal platform for Burak Akçakanat, presenting venture architecture, leadership intelligence, and GCC-Turkiye growth strategy.",
  openGraph: {
    title: "Burak Akçakanat | Strategic Venture Architect",
    description:
      "Premium bilingual personal platform for Burak Akçakanat, presenting venture architecture, leadership intelligence, and GCC-Turkiye growth strategy.",
    url: "https://burakakcakanat.com.tr",
    siteName: "burakakcakanat.com.tr",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Burak Akçakanat | Strategic Venture Architect",
    description:
      "Premium bilingual personal platform for Burak Akçakanat, presenting venture architecture, leadership intelligence, and GCC-Turkiye growth strategy."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

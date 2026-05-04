import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VCG_ — The Venture Creative Group · Building Belief in a Brand New World",
  description:
    "The Venture Creative Group. Branding, capital, and campaign work for the world's most ambitious founders.",
  openGraph: {
    title: "VCG_ — Building Belief in a Brand New World",
    description:
      "The Venture Creative Group. Branding, capital, and campaign work for the world's most ambitious founders.",
    url: "https://vcg.xyz",
    siteName: "VCG_",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

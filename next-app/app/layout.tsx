import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppShell } from "../components/AppShell";
import { Web3Provider } from "../components/Web3Provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Gridz",
    template: "%s · Gridz",
  },
  description: "Cryptographically-attested profiles for humans, AI agents, and organizations.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gridz.bio"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <Web3Provider>
          <AppShell>{children}</AppShell>
        </Web3Provider>
      </body>
    </html>
  );
}

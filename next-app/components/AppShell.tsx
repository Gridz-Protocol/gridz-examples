"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { MyProfilesMenu } from "./MyProfilesMenu";
import { demoProfileUrl } from "../lib/demoProfile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");
  const isForAi = pathname.startsWith("/for-ai");

  return (
    <div className="site-shell">
      <header className="site-nav">
        <Link href="/" className="site-nav__brand">
          <span className="site-nav__mark" aria-hidden />
          Gridz
        </Link>
        <nav className="site-nav__links" aria-label="Main">
          <Link href="/" className={`site-nav__link${pathname === "/" ? " site-nav__link--active" : ""}`}>
            Home
          </Link>
          <Link href="/find" className={`site-nav__link${pathname === "/find" ? " site-nav__link--active" : ""}`}>
            Find
          </Link>
          <Link
            href="/claim"
            className={`site-nav__link${pathname === "/claim" ? " site-nav__link--active" : ""}`}
          >
            Claim
          </Link>
          <Link href="/docs" className={`site-nav__link${isDocs ? " site-nav__link--active" : ""}`}>
            Docs
          </Link>
          <Link href="/for-ai" className={`site-nav__link${isForAi ? " site-nav__link--active" : ""}`}>
            For AI
          </Link>
          <a href={demoProfileUrl()} className="site-nav__link">
            Demo
          </a>
        </nav>
        <div className="site-nav__actions">
          <MyProfilesMenu />
          <WalletButton />
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        Cryptographically-attested profiles on{" "}
        <a href="https://gridz.bio">gridz.bio</a> · identity on{" "}
        <code>*.gridz.eth</code> · <a href="/for-ai">For AI</a> · <a href="/llms.txt">llms.txt</a>
      </footer>
    </div>
  );
}

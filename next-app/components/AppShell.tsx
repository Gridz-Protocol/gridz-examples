"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isApexSiteHost, siteHomeUrl } from "../lib/subjectFromHost";
import { WalletButton } from "./WalletButton";
import { MyProfilesMenu } from "./MyProfilesMenu";
import { demoProfileUrl } from "../lib/demoProfile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");
  const isForAi = pathname.startsWith("/for-ai");
  const siteHome = siteHomeUrl();
  const [onApexSite, setOnApexSite] = useState(false);

  useEffect(() => {
    setOnApexSite(isApexSiteHost(window.location.hostname));
  }, []);

  const isHomeActive = onApexSite && pathname === "/";

  return (
    <div className="site-shell">
      <header className="site-nav">
        <a href={siteHome} className="site-nav__brand">
          <span className="site-nav__mark" aria-hidden />
          Gridz
        </a>
        <nav className="site-nav__links" aria-label="Main">
          <a href={siteHome} className={`site-nav__link${isHomeActive ? " site-nav__link--active" : ""}`}>
            Home
          </a>
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
        <code>*.gridz.eth</code> · <a href="/for-ai">For AI</a> · <a href="/llms.txt">llms.txt</a> ·{" "}
        <a
          href="https://github.com/orgs/Gridz-Protocol/repositories"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

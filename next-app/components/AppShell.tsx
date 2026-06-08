"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");

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
          <Link href="/docs" className={`site-nav__link${isDocs ? " site-nav__link--active" : ""}`}>
            Docs
          </Link>
          <a href="https://gridz.dev" className="site-nav__link" target="_blank" rel="noreferrer">
            gridz.dev ↗
          </a>
        </nav>
        <div className="site-nav__actions">
          <WalletButton />
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        Cryptographically-attested profiles on{" "}
        <a href="https://gridz.bio">gridz.bio</a> · identity on{" "}
        <code>*.gridz.eth</code>
      </footer>
    </div>
  );
}

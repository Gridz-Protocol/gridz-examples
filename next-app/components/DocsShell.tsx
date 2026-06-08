"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/claim", label: "Claim your profile" },
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/concepts", label: "Concepts" },
  { href: "/docs/verification", label: "Verification" },
];

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="docs-layout">
      <nav className="docs-nav" aria-label="Documentation">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/claim">Claim at gridz.bio/claim</Link>
      </nav>
      <article className="docs-content">{children}</article>
    </div>
  );
}

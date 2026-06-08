"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/claim", label: "Claim your profile" },
  { href: "/docs/using-gridz", label: "Using gridz.bio" },
  { href: "/docs/concepts", label: "Concepts" },
  { href: "/docs/api", label: "API & integrations" },
  { href: "/docs/toolkit", label: "Toolkit" },
  { href: "/docs/cli", label: "CLI" },
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

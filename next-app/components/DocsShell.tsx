"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/docs", label: "Introduction" },
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
        <a href="https://gridz.dev" target="_blank" rel="noreferrer">
          Full docs on gridz.dev ↗
        </a>
      </nav>
      <article className="docs-content">{children}</article>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SPEC_NAV = [
  { href: "/docs/spec", label: "Overview" },
  { href: "/docs/spec/grid", label: "Grid model" },
  { href: "/docs/spec/keys", label: "Standard keys" },
  { href: "/docs/spec/canonicalization", label: "Canonicalization" },
  { href: "/docs/spec/attestations", label: "Attestations" },
  { href: "/docs/spec/sinks", label: "Sinks" },
  { href: "/docs/spec/on-chain", label: "On-chain (Base)" },
];

export default function SpecLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="spec-layout">
      <nav className="spec-subnav" aria-label="Specification">
        {SPEC_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="spec-body">{children}</div>
    </div>
  );
}

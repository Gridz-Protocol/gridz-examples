"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDraftSubjects } from "../lib/listDrafts";
import { listRecentProfiles } from "../lib/recentProfiles";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export function MyProfilesMenu() {
  const [drafts, setDrafts] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDrafts(listDraftSubjects());
    setRecent(listRecentProfiles());
  }, [open]);

  const items = [...new Set([...drafts, ...recent])];
  if (items.length === 0) return null;

  return (
    <div className="my-profiles">
      <button type="button" className="site-btn site-btn--ghost" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        My profiles
      </button>
      {open ? (
        <div className="my-profiles__menu" role="menu">
          {drafts.length > 0 ? <p className="my-profiles__label">Drafts (this browser)</p> : null}
          {drafts.map((subject) => (
            <Link key={`d-${subject}`} href={`/${encodeURIComponent(subject)}`} className="my-profiles__item" onClick={() => setOpen(false)}>
              <span>{subject.split(".")[0]}</span>
              <span className="site-badge site-badge--draft">Draft</span>
            </Link>
          ))}
          {recent.filter((s) => !drafts.includes(s)).length > 0 ? (
            <p className="my-profiles__label">Recent</p>
          ) : null}
          {recent
            .filter((s) => !drafts.includes(s))
            .map((subject) => (
              <Link key={`r-${subject}`} href={`/${encodeURIComponent(subject)}`} className="my-profiles__item" onClick={() => setOpen(false)}>
                <span>{subject.split(".")[0]}</span>
                <span className="my-profiles__sub">{subject.split(".")[0]}.{SITE_DOMAIN}</span>
              </Link>
            ))}
          <Link href="/find" className="my-profiles__footer" onClick={() => setOpen(false)}>
            Find another profile →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

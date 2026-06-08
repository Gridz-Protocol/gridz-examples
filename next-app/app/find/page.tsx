"use client";

import Link from "next/link";
import { ProfileLookup } from "../../components/ProfileLookup";
import { listDraftSubjects } from "../../lib/listDrafts";
import { listRecentProfiles } from "../../lib/recentProfiles";
import { useEffect, useState } from "react";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export default function FindPage() {
  const [drafts, setDrafts] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setDrafts(listDraftSubjects());
    setRecent(listRecentProfiles());
  }, []);

  return (
    <div className="find-page">
      <section className="find-hero">
        <h1>Find a profile</h1>
        <p className="find-hero__lead">
          Look up any <code>alias.gridz.eth</code> profile — see if it exists on-chain, view it, or claim an
          available name.
        </p>
        <ProfileLookup autoFocus />
      </section>

      {drafts.length > 0 ? (
        <section className="find-section">
          <h2>Your drafts</h2>
          <p className="find-section__hint">Signed in this browser but not published yet.</p>
          <ul className="find-list">
            {drafts.map((subject) => (
              <li key={subject}>
                <Link href={`/${encodeURIComponent(subject)}`}>{subject}</Link>
                <span className="site-badge site-badge--draft">Draft</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="find-section">
          <h2>Recently viewed</h2>
          <ul className="find-list">
            {recent.map((subject) => (
              <li key={subject}>
                <Link href={`/${encodeURIComponent(subject)}`}>{subject}</Link>
                <span className="find-list__sub">{subject.split(".")[0]}.{SITE_DOMAIN}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="find-more">
        New here? <Link href="/claim">Claim your profile</Link>
      </p>
    </div>
  );
}

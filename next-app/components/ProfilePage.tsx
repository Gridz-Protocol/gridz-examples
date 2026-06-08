"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Grid } from "@gridz/core";
import { ClaimSteps } from "./ClaimSteps";
import { ProfileEditor } from "./ProfileEditor";
import { SpritzProfile } from "./SpritzProfile";
import { loadDraft } from "../lib/drafts";
import { mergeGrids } from "../lib/mergeGrids";
import { rememberProfile } from "../lib/recentProfiles";
import { bioUrlForEns } from "../lib/subjectFromHost";
import { isDemoProfile } from "../lib/demoProfile";

export interface ProfilePageProps {
  subject: string;
  chainGrid: Grid | null;
  startClaiming?: boolean;
}

export function ProfilePage({ subject, chainGrid, startClaiming = false }: ProfilePageProps) {
  const router = useRouter();
  const publishedRef = useRef(false);
  const [editing, setEditing] = useState(startClaiming);
  const [grid, setGrid] = useState<Grid | null>(chainGrid);
  const [source, setSource] = useState<"chain" | "draft" | "none">(chainGrid ? "chain" : "none");

  const bioUrl = useMemo(() => bioUrlForEns(subject), [subject]);
  const displayAlias = subject.split(".")[0] ?? subject;

  useEffect(() => {
    rememberProfile(subject);
  }, [subject]);

  useEffect(() => {
    if (publishedRef.current) {
      publishedRef.current = false;
      return;
    }
    const draft = loadDraft(subject);
    const merged = mergeGrids(chainGrid, draft);
    if (merged) {
      const chainKeys = new Set(chainGrid?.cells.map((c) => c.key) ?? []);
      const draftOnly = draft?.cells.some((c) => !chainKeys.has(c.key)) ?? false;
      setGrid(merged);
      setSource(chainGrid ? (draftOnly ? "draft" : "chain") : "draft");
    } else {
      setGrid(null);
      setSource("none");
    }
  }, [chainGrid, subject]);

  const onSaved = useCallback(
    (g: Grid, src: "draft" | "chain") => {
      publishedRef.current = src === "chain";
      setGrid(g);
      setSource(src);
      setEditing(false);
      if (src === "chain") router.refresh();
    },
    [router],
  );

  const demo = isDemoProfile(subject);

  return (
    <>
      {demo ? (
        <div className="demo-banner" role="note">
          <span>🚀 Demo profile</span>
          <p>
            Fictional showcase (Nova Chen) — signed with <code>GRIDZ_SIGNER_KEY</code> and published
            like any real profile. Run <code>pnpm demo:publish</code> to refresh.
          </p>
        </div>
      ) : null}
      <div className="profile-layout profile-layout--toolbar">
        <div className="profile-toolbar">
          <div className="profile-toolbar__meta">
            <p className="profile-toolbar__sub">
              <code>{subject}</code>
              {bioUrl ? (
                <>
                  {" "}
                  · <a href={bioUrl}>{bioUrl.replace("https://", "")}</a>
                </>
              ) : null}
              {" "}
              ·{" "}
              <a href={`/api/profile/${encodeURIComponent(subject)}`} target="_blank" rel="noreferrer">
                JSON API
              </a>
            </p>
          </div>
          {source === "chain" ? <span className="site-badge site-badge--live">On-chain</span> : null}
          {source === "draft" ? <span className="site-badge site-badge--draft">Draft</span> : null}
          <button type="button" className="site-btn site-btn--primary" onClick={() => setEditing((v) => !v)}>
            {editing ? "Close editor" : grid ? "Edit profile" : "Claim profile"}
          </button>
        </div>
        {editing ? (
          <>
            {source === "none" ? <ClaimSteps ensName={subject} /> : null}
            <ProfileEditor ensName={subject} initial={grid} onSaved={onSaved} isClaim={source === "none"} />
          </>
        ) : null}
      </div>

      {grid ? (
        <SpritzProfile grid={grid} subject={subject} />
      ) : (
        <div className="profile-layout">
          <div className="profile-empty">
            <h2>No profile yet</h2>
            <p>
              <strong>{displayAlias}</strong> hasn&apos;t published a Gridz profile to <code>{subject}</code>.
              Connect your wallet and claim it — your page will live at{" "}
              {bioUrl ? <a href={bioUrl}>{bioUrl.replace("https://", "")}</a> : "your gridz.bio subdomain"}.
            </p>
            <button type="button" className="site-btn site-btn--primary" onClick={() => setEditing(true)}>
              Claim this profile
            </button>
            <p style={{ marginTop: 16, fontSize: 14 }}>
              Or start from <a href="/claim">gridz.bio/claim</a> for the full walkthrough.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

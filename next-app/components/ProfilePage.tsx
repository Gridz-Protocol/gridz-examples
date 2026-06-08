"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Grid } from "@gridz/core";
import { ProfileEditor } from "./ProfileEditor";
import { SpritzProfile } from "./SpritzProfile";
import { loadDraft } from "../lib/drafts";
import { bioUrlForEns } from "../lib/subjectFromHost";

export interface ProfilePageProps {
  subject: string;
  chainGrid: Grid | null;
}

export function ProfilePage({ subject, chainGrid }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [grid, setGrid] = useState<Grid | null>(chainGrid);
  const [source, setSource] = useState<"chain" | "draft" | "none">(chainGrid ? "chain" : "none");

  const bioUrl = useMemo(() => bioUrlForEns(subject), [subject]);
  const displayAlias = subject.split(".")[0] ?? subject;

  useEffect(() => {
    if (chainGrid) {
      setGrid(chainGrid);
      setSource("chain");
      return;
    }
    const draft = loadDraft(subject);
    if (draft) {
      setGrid(draft);
      setSource("draft");
    } else {
      setGrid(null);
      setSource("none");
    }
  }, [chainGrid, subject]);

  const onSaved = useCallback((g: Grid, src: "draft" | "chain") => {
    setGrid(g);
    setSource(src);
    setEditing(false);
  }, []);

  return (
    <>
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
        {editing ? <ProfileEditor ensName={subject} initial={grid} onSaved={onSaved} /> : null}
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
          </div>
        </div>
      )}
    </>
  );
}

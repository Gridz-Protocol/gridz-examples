"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Grid } from "@gridz/core";
import { ClaimSteps } from "./ClaimSteps";
import { ProfileEditor } from "./ProfileEditor";
import { ProfileVerifyModal } from "./ProfileVerifyModal";
import { SpritzProfile } from "./SpritzProfile";
import { profileApiUrl } from "../lib/profileVerifyGuide";
import { loadDraftBundle } from "../lib/drafts";
import { mergeFieldPreview } from "../lib/previewGrid";
import { rememberProfile } from "../lib/recentProfiles";
import { bioUrlForEns } from "../lib/subjectFromHost";
import { isDemoProfile } from "../lib/demoProfile";
import { canEditProfile, isProfileSigner, isRegistrarOnlyPublish } from "../lib/canEditProfile";
import { useWallet } from "../lib/wallet";

export interface ProfilePageProps {
  subject: string;
  chainGrid: Grid | null;
  startClaiming?: boolean;
}

export function ProfilePage({ subject, chainGrid, startClaiming = false }: ProfilePageProps) {
  const router = useRouter();
  const { address, targetChainId } = useWallet();
  const publishedRef = useRef(false);
  const [editing, setEditing] = useState(startClaiming && !chainGrid);
  const [grid, setGrid] = useState<Grid | null>(chainGrid);
  const [source, setSource] = useState<"chain" | "draft" | "none">(chainGrid ? "chain" : "none");
  const [draftBundle, setDraftBundle] = useState(() => loadDraftBundle(subject));
  const [verifyOpen, setVerifyOpen] = useState(false);

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
    const bundle = loadDraftBundle(subject);
    setDraftBundle(bundle);
    if (bundle) {
      const merged = mergeFieldPreview(chainGrid, bundle.fields, subject);
      setGrid(merged);
      setSource(chainGrid ? "draft" : "draft");
    } else if (chainGrid) {
      setGrid(chainGrid);
      setSource("chain");
    } else {
      setGrid(null);
      setSource("none");
    }
  }, [chainGrid, subject]);

  const onPreview = useCallback((g: Grid) => {
    setGrid(g);
    setSource((s) => (s === "none" ? s : "draft"));
  }, []);

  const onSaved = useCallback(
    (g: Grid, src: "draft" | "chain") => {
      publishedRef.current = src === "chain";
      setGrid(g);
      setSource(src);
      setDraftBundle(loadDraftBundle(subject));
      if (src === "chain") {
        setEditing(false);
        router.refresh();
      }
    },
    [router, subject],
  );

  const demo = isDemoProfile(subject);
  const registrarAddress = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS ?? "";
  const incompleteClaim =
    chainGrid != null && isRegistrarOnlyPublish(chainGrid, targetChainId, registrarAddress);
  const canEdit =
    !demo &&
    canEditProfile({
      chainGrid,
      draftBundle,
      walletAddress: address,
      chainId: targetChainId,
      registrarAddress,
    });
  const isChainOwner = isProfileSigner({
    chainGrid,
    draftBundle,
    walletAddress: address,
    chainId: targetChainId,
  });

  useEffect(() => {
    if (!canEdit && editing) setEditing(false);
  }, [canEdit, editing]);

  return (
    <>
      {demo ? (
        <div className="demo-banner" role="note">
          <span>🚀 Live widget showcase</span>
          <p>
            Spritz-style demo — stats, poll, countdown, guestbook, and more. Signed with{" "}
            <code>GRIDZ_SIGNER_KEY</code> and published on-chain like any real profile. Run{" "}
            <code>pnpm demo:publish</code> to refresh.
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
              <a href={profileApiUrl(subject)} target="_blank" rel="noreferrer noopener">
                JSON API
              </a>
            </p>
          </div>
          {source === "chain" ? <span className="site-badge site-badge--live">On-chain</span> : null}
          {source === "draft" ? <span className="site-badge site-badge--draft">Draft</span> : null}
          <div className="profile-toolbar__actions">
            <button type="button" className="site-btn" onClick={() => setVerifyOpen(true)}>
              Verify profile
            </button>
            {canEdit ? (
              <button type="button" className="site-btn site-btn--primary" onClick={() => setEditing((v) => !v)}>
                {editing
                  ? "Close editor"
                  : source === "none" || incompleteClaim
                    ? "Claim profile"
                    : "Edit profile"}
              </button>
            ) : null}
          </div>
        </div>
        {editing && canEdit ? (
          <>
            {source === "none" ? <ClaimSteps ensName={subject} /> : null}
            <ProfileEditor
              key={`editor-${subject}`}
              ensName={subject}
              initial={chainGrid}
              chainBaseline={chainGrid}
              signedBaseline={draftBundle?.signedBaseline ?? null}
              initialFields={draftBundle?.fields ?? null}
              onSaved={onSaved}
              onPreview={onPreview}
              isClaim={source === "none" || incompleteClaim}
            />
          </>
        ) : null}
      </div>

      {verifyOpen ? (
        <ProfileVerifyModal
          subject={subject}
          grid={chainGrid}
          isDraft={source === "draft"}
          onClose={() => setVerifyOpen(false)}
        />
      ) : null}

      {grid ? (
        <SpritzProfile grid={grid} subject={subject} showOwnerHints={isChainOwner} />
      ) : (
        <div className="profile-layout">
          <div className="profile-empty">
            <h2>No profile yet</h2>
            <p>
              <strong>{displayAlias}</strong> hasn&apos;t published a Gridz profile to <code>{subject}</code>.
              Connect your wallet and claim it — your page will live at{" "}
              {bioUrl ? <a href={bioUrl}>{bioUrl.replace("https://", "")}</a> : "your gridz.bio subdomain"}.
            </p>
            <div className="profile-empty__actions">
              <button type="button" className="site-btn" onClick={() => setVerifyOpen(true)}>
                Verify profile
              </button>
              <button type="button" className="site-btn site-btn--primary" onClick={() => setEditing(true)}>
                Claim this profile
              </button>
            </div>
            <p style={{ marginTop: 16, fontSize: 14 }}>
              Or start from <a href="/claim">gridz.bio/claim</a> for the full walkthrough.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

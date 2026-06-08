"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toEnsSubname } from "../lib/ensNames";
import { loadDraftBundle } from "../lib/drafts";
import { rememberProfile } from "../lib/recentProfiles";

const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

type LookupState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "found"; subject: string; displayName: string; isDraft?: boolean }
  | { phase: "missing"; subject: string }
  | { phase: "error"; message: string };

export interface ProfileLookupProps {
  autoFocus?: boolean;
  showClaimHint?: boolean;
}

export function ProfileLookup({ autoFocus, showClaimHint = true }: ProfileLookupProps) {
  const [alias, setAlias] = useState("");
  const [state, setState] = useState<LookupState>({ phase: "idle" });
  const router = useRouter();

  const resolveSubject = useCallback((raw: string) => {
    const trimmed = raw.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
    if (!trimmed) return "";
    return trimmed.includes(".") ? trimmed : toEnsSubname(trimmed, ENS_BASE);
  }, []);

  const lookup = useCallback(
    async (raw: string) => {
      const subject = resolveSubject(raw);
      if (!subject) return;
      setState({ phase: "loading" });
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(subject)}`);
        const data = (await res.json()) as {
          ok: boolean;
          subject?: string;
          grid?: { subject?: { display_name?: string } };
        };
        rememberProfile(subject);
        if (data.ok && data.grid) {
          setState({
            phase: "found",
            subject,
            displayName: data.grid.subject?.display_name ?? subject.split(".")[0] ?? subject,
            isDraft: false,
          });
        } else {
          const bundle = loadDraftBundle(subject);
          if (bundle) {
            setState({
              phase: "found",
              subject,
              displayName: bundle.fields.alias.trim() || (subject.split(".")[0] ?? subject),
              isDraft: true,
            });
          } else {
            setState({ phase: "missing", subject });
          }
        }
      } catch (e) {
        setState({ phase: "error", message: e instanceof Error ? e.message : String(e) });
      }
    },
    [resolveSubject],
  );

  const short = alias.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const bioHost = short ? `${short}.${SITE_DOMAIN}` : "";

  return (
    <div className="profile-lookup">
      <form
        className="profile-lookup__form"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(alias);
        }}
      >
        <input
          className="site-input profile-lookup__input"
          value={alias}
          onChange={(e) => {
            setAlias(e.target.value);
            if (state.phase !== "idle" && state.phase !== "loading") setState({ phase: "idle" });
          }}
          placeholder="kevin or kevin.gridz.eth"
          aria-label="Profile name"
          autoFocus={autoFocus}
        />
        <button type="submit" className="site-btn site-btn--primary" disabled={!short || state.phase === "loading"}>
          {state.phase === "loading" ? "Looking…" : "Find profile"}
        </button>
      </form>

      {short ? (
        <p className="profile-lookup__hint">
          Looks up <code>{short}.{ENS_BASE}</code> · <code>{bioHost}</code>
        </p>
      ) : null}

      {state.phase === "found" ? (
        <div className="profile-lookup__result profile-lookup__result--found">
          <p>
            <strong>{state.displayName}</strong>{" "}
            {state.isDraft ? (
              <>has a <span className="site-badge site-badge--draft">draft</span> in this browser — not published yet.</>
            ) : (
              <>is on Gridz — published on-chain.</>
            )}
          </p>
          <div className="profile-lookup__actions">
            <button
              type="button"
              className="site-btn site-btn--primary"
              onClick={() => router.push(`/${encodeURIComponent(state.subject)}`)}
            >
              View profile
            </button>
            <button
              type="button"
              className="site-btn"
              onClick={() => router.push(`/${encodeURIComponent(state.subject)}?claim=1`)}
            >
              Edit
            </button>
          </div>
        </div>
      ) : null}

      {state.phase === "missing" ? (
        <div className="profile-lookup__result profile-lookup__result--missing">
          <p>
            No published profile for <code>{state.subject}</code> yet.
            {loadDraftBundle(state.subject)
              ? " You have a local draft in this browser — open Edit to continue."
              : null}
          </p>
          {showClaimHint ? (
            <div className="profile-lookup__actions">
              <button
                type="button"
                className="site-btn site-btn--primary"
                onClick={() => router.push(`/${encodeURIComponent(state.subject)}?claim=1`)}
              >
                Claim {state.subject.split(".")[0]}
              </button>
              {loadDraftBundle(state.subject) ? (
                <button
                  type="button"
                  className="site-btn"
                  onClick={() => router.push(`/${encodeURIComponent(state.subject)}`)}
                >
                  Open draft
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {state.phase === "error" ? (
        <p className="profile-lookup__error">{state.message}</p>
      ) : null}
    </div>
  );
}

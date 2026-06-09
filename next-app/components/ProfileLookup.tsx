"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadDraftBundle } from "../lib/drafts";
import { bundleIsPublished } from "../lib/profileSource";
import { rememberProfile } from "../lib/recentProfiles";
import {
  type ProfileSearchMatch,
  resolveSearchSubject,
  searchProfileMatches,
} from "../lib/profileSearch";

const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

function hasUnpublishedDraft(subject: string): boolean {
  const bundle = loadDraftBundle(subject);
  return bundle != null && !bundleIsPublished(bundle);
}

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
  const [suggestions, setSuggestions] = useState<ProfileSearchMatch[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchGen = useRef(0);
  const router = useRouter();

  const resolveSubject = useCallback((raw: string) => resolveSearchSubject(raw), []);

  useEffect(() => {
    const q = alias.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const gen = ++searchGen.current;
    setSuggestionsLoading(true);

    const timer = window.setTimeout(() => {
      void searchProfileMatches(q).then((matches) => {
        if (searchGen.current !== gen) return;
        setSuggestions(matches);
        setSuggestionsLoading(false);
      });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [alias]);

  const openProfile = useCallback(
    (subject: string) => {
      rememberProfile(subject);
      router.push(`/${encodeURIComponent(subject)}`);
    },
    [router],
  );

  const lookup = useCallback(
    async (raw: string) => {
      const subject = resolveSubject(raw);
      if (!subject) return;
      setState({ phase: "loading" });
      setSuggestions([]);
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
            const isActualDraft = !bundleIsPublished(bundle);
            setState({
              phase: "found",
              subject,
              displayName: bundle.fields.alias.trim() || (subject.split(".")[0] ?? subject),
              isDraft: isActualDraft,
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
  const showSuggestions =
    alias.trim().length > 0 &&
    state.phase !== "loading" &&
    (suggestions.length > 0 || suggestionsLoading);

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
          aria-autocomplete="list"
          aria-controls={showSuggestions ? "profile-lookup-suggestions" : undefined}
          autoFocus={autoFocus}
        />
        <button type="submit" className="site-btn site-btn--primary" disabled={!short || state.phase === "loading"}>
          {state.phase === "loading" ? "Looking…" : "Find profile"}
        </button>
      </form>

      {showSuggestions ? (
        <ul id="profile-lookup-suggestions" className="profile-lookup__suggestions" role="listbox">
          {suggestionsLoading && suggestions.length === 0 ? (
            <li className="profile-lookup__suggestion profile-lookup__suggestion--muted">Searching…</li>
          ) : null}
          {suggestions.map((match) => (
            <li key={match.subject} role="option">
              <button
                type="button"
                className="profile-lookup__suggestion"
                onClick={() => openProfile(match.subject)}
              >
                <span className="profile-lookup__suggestion-main">
                  <strong>{match.displayName ?? match.alias}</strong>
                  <span className="profile-lookup__suggestion-sub">{match.subject}</span>
                </span>
                {match.status === "published" ? (
                  <span className="site-badge site-badge--live">On-chain</span>
                ) : match.status === "draft" ? (
                  <span className="site-badge site-badge--draft">Draft</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {short && !showSuggestions ? (
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
              onClick={() => openProfile(state.subject)}
            >
              View profile
            </button>
            {state.isDraft ? (
              <button
                type="button"
                className="site-btn"
                onClick={() => router.push(`/${encodeURIComponent(state.subject)}?claim=1`)}
              >
                Edit
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {state.phase === "missing" ? (
        <div className="profile-lookup__result profile-lookup__result--missing">
          <p>
            No published profile for <code>{state.subject}</code> yet.
            {hasUnpublishedDraft(state.subject)
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
              {hasUnpublishedDraft(state.subject) ? (
                <button
                  type="button"
                  className="site-btn"
                  onClick={() => openProfile(state.subject)}
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

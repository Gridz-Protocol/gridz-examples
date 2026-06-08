"use client";

import { useMemo } from "react";
import type { Grid, VerifyProof } from "@gridz/core";
import { themeToCssVars } from "@gridz/react";
import { useVerification, type BadgeStatus } from "@gridz/react";
import { headerFromGrid, socialCells, widgetCells } from "../lib/profileLayout";
import { productionVerifyContext } from "../lib/verifyContext";
import { verifyStatusMeta } from "../lib/verificationUi";
import {
  resolveSpritzWidget,
  spritzSpan,
} from "./spritz/SpritzWidgets";
import { ProfileAvatar } from "./ProfileAvatar";
import { FieldVerifyBadge } from "./FieldVerifyBadge";
import { demoAvatarForDisplay } from "../lib/demoProfile";
import { normalizeUrl } from "../lib/normalizeUrl";
import "./spritz-profile.css";

export interface SpritzProfileProps {
  grid: Grid;
  subject: string;
  /** Show editor hints (e.g. empty widget state) — only for the profile owner. */
  showOwnerHints?: boolean;
}

const HERO_VERIFY_KEYS = ["alias", "description", "avatar", "url", "header"] as const;

export function SpritzProfile({ grid, subject, showOwnerHints = false }: SpritzProfileProps) {
  const verifyCtx = useMemo(() => productionVerifyContext(subject), [subject]);
  const verification = useVerification(grid, verifyCtx);
  const header = headerFromGrid(grid, subject);
  const avatar = demoAvatarForDisplay(subject, header.avatar);
  const widgets = widgetCells(grid);
  const socials = socialCells(grid);
  const profileOk = verification.ok && !verification.loading;

  const messageMe = grid.cells.find((c) => c.key === "gridz.message_me");
  const heroFields = grid.cells.filter(
    (c) => c.is_visible && (HERO_VERIFY_KEYS as readonly string[]).includes(c.key),
  );

  const cellResult = (cellId: string) =>
    verification.report?.cells.find((c) => c.id === cellId)?.result;

  return (
    <div className="spritz-profile" style={themeToCssVars(grid.theme)}>
      {header.header ? (
        <div
          className="spritz-profile__banner"
          style={{ backgroundImage: `url(${header.header})` }}
        />
      ) : null}

      <section className="spritz-hero">
        <div className="spritz-hero__avatar-wrap">
          <ProfileAvatar src={avatar} fallbackLetter={header.alias} />
          {cellResult("avatar") ? (
            <FieldVerifyBadge
              compact
              status={verification.cells.avatar ?? "loading"}
              proof={cellResult("avatar")?.proof}
              reason={cellResult("avatar")?.reason}
            />
          ) : null}
        </div>
        <div className="spritz-hero__body">
          <div className="spritz-hero__title-row">
            <h1>{header.alias}</h1>
            {profileOk ? <span className="spritz-verified">✓ Verified</span> : null}
            {verification.loading ? <span className="spritz-verified spritz-verified--pending">…</span> : null}
          </div>
          <p className="spritz-hero__handle">{header.handle}</p>
          {header.description ? <p className="spritz-hero__bio">{header.description}</p> : null}
          {heroFields.length > 0 ? (
            <ul className="spritz-hero__verify-fields" aria-label="Verified profile fields">
              {heroFields.map((cell) => {
                const result = cellResult(cell.id);
                return (
                  <li key={cell.id}>
                    <span className="spritz-hero__verify-key">{labelForKey(cell.key)}</span>
                    <FieldVerifyBadge
                      compact
                      status={verification.cells[cell.id] ?? "loading"}
                      proof={result?.proof}
                      reason={result?.reason}
                    />
                  </li>
                );
              })}
            </ul>
          ) : null}
          {socials.length > 0 || widgets.length > 0 ? (
            <p className="spritz-hero__meta">
              {socials.length > 0
                ? `${socials.length} link${socials.length === 1 ? "" : "s"}`
                : null}
              {socials.length > 0 && widgets.length > 0 ? " · " : null}
              {widgets.length > 0
                ? `${widgets.length} widget${widgets.length === 1 ? "" : "s"}`
                : null}
            </p>
          ) : null}
          <div className="spritz-hero__actions">
            {messageMe && typeof messageMe.value === "string" && messageMe.value.trim() ? (
              <a className="spritz-cta" href={normalizeUrl(String(messageMe.value))} target="_blank" rel="noreferrer noopener">
                Message me
              </a>
            ) : null}
            {header.url ? (
              <a className="spritz-cta spritz-cta--secondary" href={normalizeUrl(header.url)} target="_blank" rel="noreferrer noopener">
                Visit site
              </a>
            ) : null}
            {socials.slice(0, 3).map((cell) => {
              const W = resolveSpritzWidget(cell);
              const result = cellResult(cell.id);
              return (
                <div key={cell.id} className="spritz-hero__social">
                  <FieldVerifyBadge
                    compact
                    status={verification.cells[cell.id] ?? "loading"}
                    proof={result?.proof}
                    reason={result?.reason}
                  />
                  <W cell={cell} subject={subject} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {widgets.length > 0 || showOwnerHints ? (
      <section className="spritz-bento">
        {widgets.length === 0 ? (
          <div className="spritz-bento__empty">
            <p>
              No widget cards yet. Open <strong>Edit profile</strong> → enable Stats, Poll, or Featured
              link under Widget cards.
            </p>
          </div>
        ) : (
          widgets.map((cell) => {
            const W = resolveSpritzWidget(cell);
            const result = cellResult(cell.id);
            const badge = cellBadge(verification.cells[cell.id] ?? "loading", result?.proof, result?.reason);
            return (
              <article
                key={cell.id}
                className={`spritz-card spritz-card--${cell.key.replace(/[^a-z0-9]/gi, "-")}`}
                data-key={cell.key}
                style={spritzSpan(cell.size)}
              >
                <header className="spritz-card__head">
                  <span className="spritz-card__label">{labelForKey(cell.key)}</span>
                  <span
                    className={`spritz-card__badge spritz-card__badge--${badge.tone}`}
                    title={badge.title}
                  >
                    {badge.glyph}
                  </span>
                </header>
                <W cell={cell} subject={subject} />
              </article>
            );
          })
        )}
      </section>
      ) : null}

      <footer className="spritz-footer">
        <span>Gridz</span>
        <a href="https://gridz.bio">Create your own profile →</a>
      </footer>
    </div>
  );
}

function labelForKey(key: string): string {
  if (key.startsWith("gridz.")) return key.replace("gridz.", "").replace(/_/g, " ");
  return key;
}

function cellBadge(
  status: BadgeStatus,
  proof?: VerifyProof,
  reason?: string,
): { glyph: string; tone: string; title: string } {
  const meta = verifyStatusMeta(status, proof, reason);
  return { glyph: meta.glyph, tone: meta.tone === "warn" ? "onchain" : meta.tone, title: meta.title };
}

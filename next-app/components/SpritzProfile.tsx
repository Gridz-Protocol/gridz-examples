"use client";

import type { Cell, Grid } from "@gridz/core";
import { themeToCssVars } from "@gridz/react";
import { useVerification, type BadgeStatus } from "@gridz/react";
import { headerFromGrid, socialCells, widgetCells } from "../lib/profileLayout";
import {
  resolveSpritzWidget,
  spritzSpan,
} from "./spritz/SpritzWidgets";
import { normalizeUrl } from "../lib/normalizeUrl";
import "./spritz-profile.css";

export interface SpritzProfileProps {
  grid: Grid;
  subject: string;
}

export function SpritzProfile({ grid, subject }: SpritzProfileProps) {
  const verification = useVerification(grid);
  const header = headerFromGrid(grid, subject);
  const widgets = widgetCells(grid);
  const socials = socialCells(grid);
  const rootOk = verification.root === "verified";

  const messageMe = grid.cells.find((c) => c.key === "gridz.message_me");

  return (
    <div className="spritz-profile" style={themeToCssVars(grid.theme)}>
      {header.header ? (
        <div
          className="spritz-profile__banner"
          style={{ backgroundImage: `url(${header.header})` }}
        />
      ) : null}

      <section className="spritz-hero">
        <div className="spritz-hero__avatar">
          {header.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={header.avatar} alt="" />
          ) : (
            <span>{header.alias.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="spritz-hero__body">
          <div className="spritz-hero__title-row">
            <h1>{header.alias}</h1>
            {rootOk ? <span className="spritz-verified">✓ Verified</span> : null}
          </div>
          <p className="spritz-hero__handle">{header.handle}</p>
          {header.description ? <p className="spritz-hero__bio">{header.description}</p> : null}
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
              return (
                <div key={cell.id} className="spritz-hero__social">
                  <W cell={cell} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
            const badge = cellBadge(cell, verification.cells[cell.id] ?? "loading");
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
                <W cell={cell} />
              </article>
            );
          })
        )}
      </section>

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
  cell: Cell,
  status: BadgeStatus,
): { glyph: string; tone: string; title: string } {
  if (status === "verified") {
    return { glyph: "✓", tone: "verified", title: "Signature verified" };
  }
  if (
    status === "failed" &&
    cell.attestation.format === "eas-onchain" &&
    cell.attestation.uid &&
    !cell.attestation.payload
  ) {
    return { glyph: "⛓", tone: "onchain", title: "On-chain EAS attestation (loaded from ENS)" };
  }
  if (status === "failed") {
    return { glyph: "!", tone: "failed", title: "Signature verification failed" };
  }
  return { glyph: "…", tone: "loading", title: "Verifying…" };
}

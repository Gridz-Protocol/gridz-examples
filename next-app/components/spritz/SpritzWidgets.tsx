"use client";

import { useEffect, useState } from "react";
import type { Cell } from "@gridz/core";
import { chainName, explorerTokenUrl } from "../../lib/chainLabels";
import { getLocalPollVote, setLocalPollVote } from "../../lib/pollVotes";

export type SpritzWidgetProps = { cell: Cell; subject?: string };

const asString = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v));

const SOCIAL_ICON: Record<string, string> = {
  "com.twitter": "𝕏",
  "com.github": "⌘",
  "com.discord": "💬",
  "org.telegram": "✈️",
  "social.bsky": "🦋",
  "xyz.farcaster": "🟣",
};

const SOCIAL_NAME: Record<string, string> = {
  "com.twitter": "X",
  "com.github": "GitHub",
  "com.discord": "Discord",
  "org.telegram": "Telegram",
  "social.bsky": "Bluesky",
  "xyz.farcaster": "Farcaster",
};

function socialLabel(key: string) {
  return SOCIAL_NAME[key] ?? key;
}

export function SpritzStats({ cell }: { cell: Cell }) {
  const entries = Array.isArray(cell.value)
    ? (cell.value as { label: string; value: unknown }[])
    : Object.entries((cell.value ?? {}) as Record<string, unknown>).map(([label, value]) => ({
        label,
        value,
      }));

  return (
    <div className="spritz-stats">
      {entries.map((e, i) => (
        <div key={i} className="spritz-stats__tile">
          <span className="spritz-stats__value">{asString(e.value)}</span>
          <span className="spritz-stats__label">{e.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SpritzPoll({ cell, subject }: SpritzWidgetProps) {
  const v = (cell.value ?? {}) as { q?: string; options?: string[]; votes?: number[] };
  const options = v.options ?? [];
  const onChainVotes = v.votes ?? options.map(() => 0);
  const onChainTotal = onChainVotes.reduce((a, b) => a + b, 0);
  const [localVote, setLocalVote] = useState<number | null>(() =>
    subject ? getLocalPollVote(subject, cell.id) : null,
  );

  const hasOnChainTally = onChainTotal > 0;
  const showBars = hasOnChainTally;
  const displayTotal = hasOnChainTally ? onChainTotal : 1;

  const vote = (index: number) => {
    if (!subject || hasOnChainTally) return;
    setLocalPollVote(subject, cell.id, index);
    setLocalVote(index);
  };

  return (
    <div className="spritz-poll">
      <h4 className="spritz-widget__title">{v.q ?? "Poll"}</h4>
      <ul className="spritz-poll__list">
        {options.map((o, i) => (
          <li key={i}>
            {showBars ? (
              <>
                <div className="spritz-poll__row">
                  <span>{o}</span>
                  <span>{Math.round((onChainVotes[i]! / displayTotal) * 100)}%</span>
                </div>
                <div className="spritz-poll__bar">
                  <div
                    className="spritz-poll__fill"
                    style={{ width: `${(onChainVotes[i]! / displayTotal) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <button
                type="button"
                className={`spritz-poll__option${localVote === i ? " spritz-poll__option--picked" : ""}`}
                onClick={() => vote(i)}
              >
                <span>{o}</span>
                {localVote === i ? <span className="spritz-poll__picked">Your vote</span> : null}
              </button>
            )}
          </li>
        ))}
      </ul>
      {hasOnChainTally ? (
        <p className="spritz-poll__meta">{onChainTotal} vote{onChainTotal === 1 ? "" : "s"} on-chain</p>
      ) : localVote != null ? (
        <p className="spritz-poll__meta">Vote saved in this browser — shared tallies ship with wallet signing</p>
      ) : (
        <p className="spritz-poll__meta">Tap an option to vote (local preview)</p>
      )}
    </div>
  );
}

export function SpritzSocial({ cell }: { cell: Cell }) {
  const icon = SOCIAL_ICON[cell.key] ?? "🔗";
  return (
    <a
      className="spritz-social-card"
      href={guessSocialUrl(cell.key, asString(cell.value))}
      target="_blank"
      rel="noreferrer noopener"
    >
      <span className="spritz-social-card__icon">{icon}</span>
      <span className="spritz-social-card__service">{socialLabel(cell.key)}</span>
      <span className="spritz-social-card__handle">{asString(cell.value)}</span>
    </a>
  );
}

export function SpritzLinkCard({ cell }: { cell: Cell }) {
  const v =
    typeof cell.value === "object" && cell.value !== null
      ? (cell.value as { label?: string; url?: string })
      : { url: asString(cell.value) };
  const href = v.url?.startsWith("http") ? v.url : `https://${v.url ?? ""}`;
  const label = v.label ?? "Link";
  return (
    <a className="spritz-link-card" href={href} target="_blank" rel="noreferrer noopener">
      <span className="spritz-link-card__icon">🔗</span>
      <span className="spritz-link-card__label">{label}</span>
      <span className="spritz-link-card__url">{v.url ?? href}</span>
    </a>
  );
}

function guessSocialUrl(key: string, handle: string): string {
  if (handle.startsWith("http")) return handle;
  if (key === "com.twitter") return `https://x.com/${handle.replace(/^@/, "")}`;
  if (key === "com.github") return `https://github.com/${handle}`;
  return `https://${key.split(".").reverse().join(".")}/${handle}`;
}

export function SpritzAvailability({ cell }: { cell: Cell }) {
  const v = (cell.value ?? {}) as { status?: string; message?: string };
  const busy = (v.status ?? asString(cell.value)).toLowerCase().includes("busy");
  return (
    <div className={`spritz-status ${busy ? "spritz-status--busy" : "spritz-status--open"}`}>
      <span className="spritz-status__dot" />
      <div>
        <strong>{busy ? "Busy" : "Available"}</strong>
        {v.message ? <p>{v.message}</p> : null}
      </div>
    </div>
  );
}

export function SpritzCurrently({ cell }: { cell: Cell }) {
  const v = (cell.value ?? {}) as { title?: string; subtitle?: string; emoji?: string };
  return (
    <div className="spritz-currently">
      <span className="spritz-currently__emoji">{v.emoji ?? "🚀"}</span>
      <div>
        <p className="spritz-currently__label">Currently</p>
        <h4>{v.title ?? asString(cell.value)}</h4>
        {v.subtitle ? <p className="spritz-currently__sub">{v.subtitle}</p> : null}
      </div>
    </div>
  );
}

export function SpritzCountdown({ cell }: { cell: Cell }) {
  const v = (cell.value ?? {}) as { label?: string; target?: string };
  const target = v.target ? new Date(v.target).getTime() : Date.now();
  const [left, setLeft] = useState(target - Date.now());

  useEffect(() => {
    const t = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  const s = Math.max(0, Math.floor(left / 1000));
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <div className="spritz-countdown">
      <h4 className="spritz-widget__title">{v.label ?? "Countdown"}</h4>
      <div className="spritz-countdown__grid">
        <div><strong>{days}</strong><span>days</span></div>
        <div><strong>{String(hrs).padStart(2, "0")}</strong><span>hrs</span></div>
        <div><strong>{String(min).padStart(2, "0")}</strong><span>min</span></div>
        <div><strong>{String(sec).padStart(2, "0")}</strong><span>sec</span></div>
      </div>
    </div>
  );
}

export function SpritzClock({ cell }: { cell: Cell }) {
  const tz = asString(cell.value);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date()),
        );
      } catch {
        setTime(new Date().toLocaleTimeString());
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tz]);

  return (
    <div className="spritz-clock">
      <span className="spritz-clock__emoji">🕐</span>
      <div>
        <p className="spritz-clock__label">{tz.replace(/_/g, " ")}</p>
        <strong className="spritz-clock__time">{time}</strong>
      </div>
    </div>
  );
}

export function SpritzGuestbook({ cell }: { cell: Cell }) {
  const entries = Array.isArray(cell.value)
    ? (cell.value as { text: string; author?: string }[])
    : [];
  return (
    <div className="spritz-guestbook">
      <h4 className="spritz-widget__title">Guestbook</h4>
      <ul>
        {entries.map((e, i) => (
          <li key={i}>
            <p>{e.text}</p>
            {e.author ? <span>— {e.author}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SpritzText({ cell }: { cell: Cell }) {
  return <p className="spritz-text">{asString(cell.value)}</p>;
}

export function SpritzTokens({ cell }: SpritzWidgetProps) {
  const raw =
    typeof cell.value === "object" && cell.value !== null && !Array.isArray(cell.value)
      ? (cell.value as { tokens?: { chainId?: number; address?: string; symbol?: string; name?: string }[] })
          .tokens
      : [];
  const tokens = Array.isArray(raw) ? raw : [];

  if (tokens.length === 0) {
    return <p className="spritz-text spritz-text--muted">No tokens listed</p>;
  }

  return (
    <ul className="spritz-tokens">
      {tokens.map((t, i) => {
        const address = typeof t.address === "string" ? t.address : "";
        const chainId = typeof t.chainId === "number" ? t.chainId : 1;
        const symbol = typeof t.symbol === "string" && t.symbol ? t.symbol : "Token";
        const name = typeof t.name === "string" && t.name ? t.name : null;
        const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—";
        const href = address ? explorerTokenUrl(chainId, address) : undefined;

        return (
          <li key={i} className="spritz-tokens__row">
            <div className="spritz-tokens__head">
              <strong className="spritz-tokens__symbol">{symbol}</strong>
              <span className="spritz-tokens__chain">{chainName(chainId)}</span>
            </div>
            {name ? <p className="spritz-tokens__name">{name}</p> : null}
            {href ? (
              <a className="spritz-tokens__addr" href={href} target="_blank" rel="noreferrer noopener">
                {short}
              </a>
            ) : (
              <span className="spritz-tokens__addr">{short}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function SpritzGeneric({ cell }: { cell: Cell }) {
  if (typeof cell.value === "object" && cell.value !== null) {
    return (
      <pre className="spritz-generic">{JSON.stringify(cell.value, null, 2)}</pre>
    );
  }
  return <p className="spritz-text">{asString(cell.value)}</p>;
}

export function resolveSpritzWidget(cell: Cell) {
  const wt = cell.widget_type ?? cell.key;
  if (wt === "gridz.stats") return SpritzStats;
  if (wt === "gridz.poll") return SpritzPoll;
  if (wt === "gridz.social_link") return SpritzLinkCard;
  if (cell.key.includes(".") && !cell.key.startsWith("gridz.")) return SpritzSocial;
  if (wt === "gridz.availability_status") return SpritzAvailability;
  if (wt === "gridz.currently") return SpritzCurrently;
  if (wt === "gridz.countdown") return SpritzCountdown;
  if (wt === "gridz.clock" || cell.key === "timezone") return SpritzClock;
  if (wt === "gridz.guestbook") return SpritzGuestbook;
  if (wt === "gridz.tokens") return SpritzTokens;
  if (wt === "gridz.text" || cell.key === "agent-context") return SpritzText;
  return SpritzGeneric;
}

export function spritzSpan(size: string): { gridColumn: string; gridRow: string } {
  const m = /^(\d+)x(\d+)$/.exec(size);
  const w = m ? Number(m[1]) : 1;
  const h = m ? Number(m[2]) : 1;
  return { gridColumn: `span ${Math.min(w, 3)}`, gridRow: `span ${h}` };
}

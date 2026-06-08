"use client";

import type { ReactNode } from "react";

import type { GuestbookEntry, ProfileEditorState, StatRow, TokenEntry } from "../lib/profileFields";
import { CHAIN_OPTIONS } from "../lib/chainLabels";
import { isWidgetEnabled, setWidgetEnabled } from "../lib/profileFields";
import { WIDGET_CATALOG, type WidgetKind } from "../lib/widgetCatalog";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

export interface ProfileWidgetFieldsProps {
  fields: ProfileEditorState;
  onChange: (next: ProfileEditorState) => void;
  disabled?: boolean;
}

export function ProfileWidgetFields({ fields, onChange, disabled }: ProfileWidgetFieldsProps) {
  const set = (patch: Partial<ProfileEditorState>) => onChange({ ...fields, ...patch });

  const toggle = (id: WidgetKind) => {
    onChange(setWidgetEnabled(fields, id, !isWidgetEnabled(fields, id)));
  };

  const setStat = (index: number, patch: Partial<StatRow>) => {
    set({ stats: fields.stats.map((row, i) => (i === index ? { ...row, ...patch } : row)) });
  };

  const setPollOption = (index: number, value: string) => {
    set({ pollOptions: fields.pollOptions.map((o, i) => (i === index ? value : o)) });
  };

  const setGuest = (index: number, patch: Partial<GuestbookEntry>) => {
    set({
      guestbookEntries: fields.guestbookEntries.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    });
  };

  const setToken = (index: number, patch: Partial<TokenEntry>) => {
    set({ tokens: fields.tokens.map((row, i) => (i === index ? { ...row, ...patch } : row)) });
  };

  return (
    <div className="profile-widgets">
      <h4 className="profile-widgets__title">Social links</h4>
      <p className="profile-widgets__hint">Shown as buttons in your profile header.</p>
      <div className="profile-widgets__grid profile-widgets__grid--social">
        <div className="site-field">
          <label className="site-label" htmlFor="twitter">X / Twitter</label>
          <input id="twitter" className="site-input" value={fields.twitter} onChange={(e) => set({ twitter: e.target.value })} placeholder="handle" disabled={disabled} />
        </div>
        <div className="site-field">
          <label className="site-label" htmlFor="github">GitHub</label>
          <input id="github" className="site-input" value={fields.github} onChange={(e) => set({ github: e.target.value })} placeholder="username" disabled={disabled} />
        </div>
        <div className="site-field">
          <label className="site-label" htmlFor="bsky">Bluesky</label>
          <input id="bsky" className="site-input" value={fields.bsky} onChange={(e) => set({ bsky: e.target.value })} placeholder="you.bsky.social" disabled={disabled} />
        </div>
        <div className="site-field">
          <label className="site-label" htmlFor="discord">Discord</label>
          <input id="discord" className="site-input" value={fields.discord} onChange={(e) => set({ discord: e.target.value })} placeholder="handle" disabled={disabled} />
        </div>
        <div className="site-field">
          <label className="site-label" htmlFor="telegram">Telegram</label>
          <input id="telegram" className="site-input" value={fields.telegram} onChange={(e) => set({ telegram: e.target.value })} placeholder="username" disabled={disabled} />
        </div>
      </div>

      <h4 className="profile-widgets__title">Add widgets</h4>
      <p className="profile-widgets__hint">
        Tap to add Spritz-style cards to your bento grid — stats, polls, countdowns, and more.
      </p>
      <div className="widget-picker">
        {WIDGET_CATALOG.map((w) => {
          const on = isWidgetEnabled(fields, w.id);
          return (
            <button
              key={w.id}
              type="button"
              className={`widget-picker__card${on ? " widget-picker__card--on" : ""}`}
              disabled={disabled}
              onClick={() => toggle(w.id)}
              aria-pressed={on}
            >
              <span className="widget-picker__icon" aria-hidden>{w.icon}</span>
              <span className="widget-picker__name">{w.name}</span>
              <span className="widget-picker__desc">{w.description}</span>
              {on ? <span className="widget-picker__badge">Added</span> : null}
            </button>
          );
        })}
      </div>

      {fields.messageMeEnabled ? (
        <WidgetPanel title="Contact button">
          <div className="site-field">
            <label className="site-label" htmlFor="message-url">Link (mailto, Telegram, cal.com…)</label>
            <input id="message-url" className="site-input" value={fields.messageMeUrl} onChange={(e) => set({ messageMeUrl: e.target.value })} placeholder="https://t.me/you" disabled={disabled} />
          </div>
        </WidgetPanel>
      ) : null}

      {fields.availabilityEnabled ? (
        <WidgetPanel title="Status">
          <div className="profile-widgets__inline">
            <label><input type="radio" checked={fields.availabilityStatus === "available"} onChange={() => set({ availabilityStatus: "available" })} disabled={disabled} /> Available</label>
            <label><input type="radio" checked={fields.availabilityStatus === "busy"} onChange={() => set({ availabilityStatus: "busy" })} disabled={disabled} /> Busy</label>
          </div>
          <input className="site-input" value={fields.availabilityMessage} onChange={(e) => set({ availabilityMessage: e.target.value })} placeholder="Optional message" disabled={disabled} />
        </WidgetPanel>
      ) : null}

      {fields.currentlyEnabled ? (
        <WidgetPanel title="Currently">
          <input className="site-input" value={fields.currentlyEmoji} onChange={(e) => set({ currentlyEmoji: e.target.value })} placeholder="Emoji" disabled={disabled} style={{ maxWidth: 80 }} />
          <input className="site-input" value={fields.currentlyTitle} onChange={(e) => set({ currentlyTitle: e.target.value })} placeholder="Title — e.g. Starship" disabled={disabled} />
          <input className="site-input" value={fields.currentlySubtitle} onChange={(e) => set({ currentlySubtitle: e.target.value })} placeholder="Subtitle" disabled={disabled} />
        </WidgetPanel>
      ) : null}

      {fields.statsEnabled ? (
        <WidgetPanel title="Stats">
          {fields.stats.map((row, i) => (
            <div key={i} className="profile-widgets__stat-row">
              <input className="site-input" value={row.label} onChange={(e) => setStat(i, { label: e.target.value })} placeholder="Label" disabled={disabled} />
              <input className="site-input" value={row.value} onChange={(e) => setStat(i, { value: e.target.value })} placeholder="Value" disabled={disabled} />
            </div>
          ))}
          <button type="button" className="site-btn" disabled={disabled || fields.stats.length >= 6} onClick={() => set({ stats: [...fields.stats, { label: "", value: "" }] })}>Add stat</button>
        </WidgetPanel>
      ) : null}

      {fields.countdownEnabled ? (
        <WidgetPanel title="Countdown">
          <input className="site-input" value={fields.countdownLabel} onChange={(e) => set({ countdownLabel: e.target.value })} placeholder="Label — e.g. Mars Mission" disabled={disabled} />
          <input className="site-input" type="datetime-local" value={fields.countdownTarget} onChange={(e) => set({ countdownTarget: e.target.value })} disabled={disabled} />
        </WidgetPanel>
      ) : null}

      {fields.pollEnabled ? (
        <WidgetPanel title="Poll">
          <p className="profile-widgets__hint">
            Question and options are signed on-chain. Visitor votes will use wallet-signed tallies later — local
            preview voting works today.
          </p>
          <input className="site-input" value={fields.pollQuestion} onChange={(e) => set({ pollQuestion: e.target.value })} placeholder="Question" disabled={disabled} />
          {fields.pollOptions.map((opt, i) => (
            <input key={i} className="site-input" value={opt} onChange={(e) => setPollOption(i, e.target.value)} placeholder={`Option ${i + 1}`} disabled={disabled} />
          ))}
          {fields.pollOptions.length < 4 ? (
            <button type="button" className="site-btn" disabled={disabled} onClick={() => set({ pollOptions: [...fields.pollOptions, ""] })}>Add option</button>
          ) : null}
        </WidgetPanel>
      ) : null}

      {fields.clockEnabled ? (
        <WidgetPanel title="Local time">
          <select className="site-input" value={fields.clockTimezone} onChange={(e) => set({ clockTimezone: e.target.value })} disabled={disabled}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
            ))}
          </select>
        </WidgetPanel>
      ) : null}

      {fields.textEnabled ? (
        <WidgetPanel title="Quote">
          <textarea className="site-textarea" rows={3} value={fields.textContent} onChange={(e) => set({ textContent: e.target.value })} placeholder="A short quote or announcement…" disabled={disabled} />
        </WidgetPanel>
      ) : null}

      {fields.guestbookEnabled ? (
        <WidgetPanel title="Guestbook">
          <p className="profile-widgets__hint">Curate messages shown on your profile (static until visitor signing ships).</p>
          {fields.guestbookEntries.map((entry, i) => (
            <div key={i} className="profile-widgets__guest-row">
              <input className="site-input" value={entry.text} onChange={(e) => setGuest(i, { text: e.target.value })} placeholder="Message" disabled={disabled} />
              <input className="site-input" value={entry.author} onChange={(e) => setGuest(i, { author: e.target.value })} placeholder="Author" disabled={disabled} />
            </div>
          ))}
          <button type="button" className="site-btn" disabled={disabled || fields.guestbookEntries.length >= 5} onClick={() => set({ guestbookEntries: [...fields.guestbookEntries, { text: "", author: "" }] })}>Add entry</button>
        </WidgetPanel>
      ) : null}

      {fields.tokensEnabled ? (
        <WidgetPanel title="Org tokens">
          <p className="profile-widgets__hint">
            For on-chain companies — list token contract addresses per chain. Balances can be fetched live later;
            this attests which tokens you officially list.
          </p>
          {fields.tokens.map((token, i) => (
            <div key={i} className="profile-widgets__token-row">
              <select
                className="site-input"
                value={token.chainId}
                onChange={(e) => setToken(i, { chainId: Number(e.target.value) })}
                disabled={disabled}
              >
                {CHAIN_OPTIONS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
              <input
                className="site-input"
                value={token.symbol}
                onChange={(e) => setToken(i, { symbol: e.target.value })}
                placeholder="Symbol — e.g. ACME"
                disabled={disabled}
              />
              <input
                className="site-input"
                value={token.name}
                onChange={(e) => setToken(i, { name: e.target.value })}
                placeholder="Name — e.g. Acme Corp"
                disabled={disabled}
              />
              <input
                className="site-input"
                value={token.address}
                onChange={(e) => setToken(i, { address: e.target.value })}
                placeholder="0x… contract address"
                disabled={disabled}
                spellCheck={false}
              />
            </div>
          ))}
          <button
            type="button"
            className="site-btn"
            disabled={disabled || fields.tokens.length >= 6}
            onClick={() =>
              set({ tokens: [...fields.tokens, { chainId: 1, address: "", symbol: "", name: "" }] })
            }
          >
            Add token
          </button>
        </WidgetPanel>
      ) : null}

      {fields.linkEnabled ? (
        <WidgetPanel title="Featured link">
          <input className="site-input" value={fields.linkLabel} onChange={(e) => set({ linkLabel: e.target.value })} placeholder="Label" disabled={disabled} />
          <input className="site-input" value={fields.linkUrl} onChange={(e) => set({ linkUrl: e.target.value })} placeholder="https://" disabled={disabled} />
        </WidgetPanel>
      ) : null}
    </div>
  );
}

function WidgetPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="profile-widgets__panel">
      <h5 className="profile-widgets__panel-title">{title}</h5>
      {children}
    </div>
  );
}

"use client";

import type { ProfileEditorState, StatRow } from "../lib/profileFields";

export interface ProfileWidgetFieldsProps {
  fields: ProfileEditorState;
  onChange: (next: ProfileEditorState) => void;
  disabled?: boolean;
}

export function ProfileWidgetFields({ fields, onChange, disabled }: ProfileWidgetFieldsProps) {
  const set = (patch: Partial<ProfileEditorState>) => onChange({ ...fields, ...patch });

  const setStat = (index: number, patch: Partial<StatRow>) => {
    const stats = fields.stats.map((row, i) => (i === index ? { ...row, ...patch } : row));
    set({ stats });
  };

  const setPollOption = (index: number, value: string) => {
    const pollOptions = fields.pollOptions.map((o, i) => (i === index ? value : o));
    set({ pollOptions });
  };

  return (
    <div className="profile-widgets">
      <h4 className="profile-widgets__title">Social links</h4>
      <p className="profile-widgets__hint">Handles appear as buttons on your profile header (not in the widget grid).</p>
      <div className="profile-widgets__grid">
        <div className="site-field">
          <label className="site-label" htmlFor="twitter">X / Twitter</label>
          <input
            id="twitter"
            className="site-input"
            value={fields.twitter}
            onChange={(e) => set({ twitter: e.target.value })}
            placeholder="handle (no @)"
            disabled={disabled}
          />
        </div>
        <div className="site-field">
          <label className="site-label" htmlFor="github">GitHub</label>
          <input
            id="github"
            className="site-input"
            value={fields.github}
            onChange={(e) => set({ github: e.target.value })}
            placeholder="username"
            disabled={disabled}
          />
        </div>
        <div className="site-field">
          <label className="site-label" htmlFor="bsky">Bluesky</label>
          <input
            id="bsky"
            className="site-input"
            value={fields.bsky}
            onChange={(e) => set({ bsky: e.target.value })}
            placeholder="handle.bsky.social"
            disabled={disabled}
          />
        </div>
      </div>

      <h4 className="profile-widgets__title">Widget cards</h4>
      <p className="profile-widgets__hint">These show in the bento grid on your public profile.</p>

      <label className="profile-widgets__toggle">
        <input
          type="checkbox"
          checked={fields.statsEnabled}
          onChange={(e) => set({ statsEnabled: e.target.checked })}
          disabled={disabled}
        />
        <span>Stats</span>
      </label>
      {fields.statsEnabled ? (
        <div className="profile-widgets__panel">
          {fields.stats.map((row, i) => (
            <div key={i} className="profile-widgets__stat-row">
              <input
                className="site-input"
                value={row.label}
                onChange={(e) => setStat(i, { label: e.target.value })}
                placeholder="Label"
                disabled={disabled}
              />
              <input
                className="site-input"
                value={row.value}
                onChange={(e) => setStat(i, { value: e.target.value })}
                placeholder="Value"
                disabled={disabled}
              />
            </div>
          ))}
          <button
            type="button"
            className="site-btn"
            disabled={disabled || fields.stats.length >= 4}
            onClick={() => set({ stats: [...fields.stats, { label: "", value: "" }] })}
          >
            Add stat
          </button>
        </div>
      ) : null}

      <label className="profile-widgets__toggle">
        <input
          type="checkbox"
          checked={fields.pollEnabled}
          onChange={(e) => set({ pollEnabled: e.target.checked })}
          disabled={disabled}
        />
        <span>Poll</span>
      </label>
      {fields.pollEnabled ? (
        <div className="profile-widgets__panel">
          <div className="site-field">
            <label className="site-label" htmlFor="poll-q">Question</label>
            <input
              id="poll-q"
              className="site-input"
              value={fields.pollQuestion}
              onChange={(e) => set({ pollQuestion: e.target.value })}
              placeholder="Ask your visitors something…"
              disabled={disabled}
            />
          </div>
          {fields.pollOptions.map((opt, i) => (
            <div key={i} className="site-field">
              <label className="site-label" htmlFor={`poll-opt-${i}`}>Option {i + 1}</label>
              <input
                id={`poll-opt-${i}`}
                className="site-input"
                value={opt}
                onChange={(e) => setPollOption(i, e.target.value)}
                placeholder={`Choice ${i + 1}`}
                disabled={disabled}
              />
            </div>
          ))}
          {fields.pollOptions.length < 4 ? (
            <button
              type="button"
              className="site-btn"
              disabled={disabled}
              onClick={() => set({ pollOptions: [...fields.pollOptions, ""] })}
            >
              Add option
            </button>
          ) : null}
        </div>
      ) : null}

      <label className="profile-widgets__toggle">
        <input
          type="checkbox"
          checked={fields.linkEnabled}
          onChange={(e) => set({ linkEnabled: e.target.checked })}
          disabled={disabled}
        />
        <span>Featured link card</span>
      </label>
      {fields.linkEnabled ? (
        <div className="profile-widgets__panel">
          <div className="site-field">
            <label className="site-label" htmlFor="link-label">Label</label>
            <input
              id="link-label"
              className="site-input"
              value={fields.linkLabel}
              onChange={(e) => set({ linkLabel: e.target.value })}
              placeholder="My newsletter"
              disabled={disabled}
            />
          </div>
          <div className="site-field">
            <label className="site-label" htmlFor="link-url">URL</label>
            <input
              id="link-url"
              className="site-input"
              value={fields.linkUrl}
              onChange={(e) => set({ linkUrl: e.target.value })}
              placeholder="https://"
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

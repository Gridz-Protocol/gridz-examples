"use client";

import { useRef, useState } from "react";
import { cropImageToSquare } from "../lib/cropImage";

export interface AvatarFieldProps {
  ensName: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function AvatarField({ ensName, value, onChange, disabled }: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const cropped = await cropImageToSquare(file);
      const body = new FormData();
      body.set("ensName", ensName);
      body.set("file", new File([cropped], "avatar.jpg", { type: "image/jpeg" }));

      const res = await fetch("/api/upload/avatar", { method: "POST", body });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!data.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed");
      }
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="site-field">
      <label className="site-label" htmlFor="avatar-url">
        Avatar <span className="site-label__hint">1:1 · stored as a signed URL on your profile</span>
      </label>
      <div className="avatar-field">
        <div className="avatar-field__preview" aria-hidden>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" />
          ) : (
            <span>?</span>
          )}
        </div>
        <div className="avatar-field__controls">
          <input
            id="avatar-url"
            className="site-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or upload below"
            disabled={disabled || uploading}
          />
          <div className="avatar-field__row">
            <button
              type="button"
              className="site-btn"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
            {value ? (
              <button type="button" className="site-btn" disabled={disabled || uploading} onClick={() => onChange("")}>
                Remove
              </button>
            ) : null}
          </div>
          <p className="avatar-field__note">
            Images are hosted on Gridz storage (Vercel Blob). Your profile stores the URL in the signed{" "}
            <code>avatar</code> cell — not the file itself.
          </p>
          {error ? <p className="avatar-field__error">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

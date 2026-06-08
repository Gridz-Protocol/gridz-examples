"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toEnsSubname } from "../lib/ensNames";

const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export function Landing() {
  const [alias, setAlias] = useState("");
  const router = useRouter();

  function goToProfile(raw: string) {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    const subject = trimmed.includes(".") ? trimmed : toEnsSubname(trimmed, ENS_BASE);
    router.push(`/${encodeURIComponent(subject)}`);
  }

  return (
    <div className="landing">
      <div className="landing__glow" aria-hidden />
      <section className="landing__hero">
        <p className="site-badge">Open · Verifiable · Agent-ready</p>
        <h1 className="landing__title">
          Your identity on <span>gridz.eth</span>
        </h1>
        <p className="landing__lead">
          Cryptographically-attested profiles for humans, AI agents, and organizations. Claim{" "}
          <code>you.{ENS_BASE}</code>, share at <code>you.{SITE_DOMAIN}</code>, and let anyone verify
          every cell independently.
        </p>
        <form
          className="landing__search"
          onSubmit={(e) => {
            e.preventDefault();
            goToProfile(alias);
          }}
        >
          <input
            className="site-input"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder={`kevin.${ENS_BASE}`}
            aria-label="Profile name"
          />
          <button type="submit" className="site-btn site-btn--primary">
            View profile
          </button>
        </form>
        <p style={{ color: "var(--site-muted)", fontSize: 14 }}>
          Try <button type="button" className="site-btn site-btn--ghost" onClick={() => goToProfile("bot")}>bot.{ENS_BASE}</button>
        </p>
      </section>
      <section className="landing__features">
        <article className="landing__card">
          <h3>Verifiable cells</h3>
          <p>Every field is signed. Visitors re-check attestations without trusting a server.</p>
        </article>
        <article className="landing__card">
          <h3>ENS subnames</h3>
          <p>
            Register <code>alias.{ENS_BASE}</code> once — wildcard resolver serves every entity under gridz.eth.
          </p>
        </article>
        <article className="landing__card">
          <h3>Edit in the browser</h3>
          <p>Connect a wallet, update your profile, and publish when your name is ready.</p>
        </article>
        <article className="landing__card">
          <h3>Pretty URLs</h3>
          <p>
            <code>kevin.{SITE_DOMAIN}</code> maps to <code>kevin.{ENS_BASE}</code> automatically.
          </p>
        </article>
      </section>
    </div>
  );
}

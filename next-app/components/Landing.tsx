"use client";

import { useRouter } from "next/navigation";
import { ProfileLookup } from "./ProfileLookup";
import { demoProfileUrl } from "../lib/demoProfile";

const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export function Landing() {
  const router = useRouter();

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
        <ProfileLookup />
        <div className="landing__cta-row">
          <button type="button" className="site-btn site-btn--primary" onClick={() => router.push("/claim")}>
            Claim yours
          </button>
          <button type="button" className="site-btn site-btn--ghost" onClick={() => router.push("/find")}>
            Find a profile
          </button>
          <a className="site-btn site-btn--ghost" href={demoProfileUrl()} aria-label="View live widget showcase demo">
            Explore widget gallery →
          </a>
        </div>
      </section>
      <section className="landing__features">
        <article className="landing__card">
          <h3>Verifiable cells</h3>
          <p>Every field is signed. Visitors re-check attestations without trusting a server.</p>
        </article>
        <article className="landing__card">
          <h3>Spritz-style widgets</h3>
          <p>Stats, polls, countdowns, guestbooks — a full bento grid like Spritz, on-chain.</p>
        </article>
        <article className="landing__card">
          <h3>Edit in the browser</h3>
          <p>Connect a wallet, add widgets, and publish when your profile is ready.</p>
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

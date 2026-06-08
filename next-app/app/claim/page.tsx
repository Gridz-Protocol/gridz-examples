"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileLookup } from "../../components/ProfileLookup";
import { toEnsSubname } from "../../lib/ensNames";

const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export default function ClaimPage() {
  const [alias, setAlias] = useState("");
  const router = useRouter();

  const clean = alias.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const ensName = clean ? toEnsSubname(clean, ENS_BASE) : "";
  const bioUrl = clean ? `https://${clean}.${SITE_DOMAIN}` : "";

  function startClaim() {
    if (!ensName) return;
    router.push(`/${encodeURIComponent(ensName)}?claim=1`);
  }

  return (
    <div className="claim-page">
      <section className="claim-hero">
        <h1>Claim your Gridz</h1>
        <p className="claim-hero__lead">
          Pick a name, connect your wallet, sign your profile, and publish. You get{" "}
          <code>you.{ENS_BASE}</code> on-chain and <code>you.{SITE_DOMAIN}</code> on the web.
        </p>
      </section>

      <section className="claim-lookup">
        <h2>Already claimed?</h2>
        <p className="claim-hero__lead">Look up your name first — view your live profile or continue a draft.</p>
        <ProfileLookup showClaimHint={false} />
      </section>

      <section className="claim-picker">
        <label className="site-label" htmlFor="claim-alias">
          Choose your alias
        </label>
        <div className="claim-picker__row">
          <input
            id="claim-alias"
            className="site-input"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="kevin"
            autoFocus
          />
          <button
            type="button"
            className="site-btn site-btn--primary"
            disabled={!clean}
            onClick={startClaim}
          >
            Claim {clean || "…"}
          </button>
        </div>
        {clean ? (
          <ul className="claim-preview">
            <li>
              ENS identity: <code>{ensName}</code>
            </li>
            <li>
              Public URL: <a href={bioUrl}>{bioUrl.replace("https://", "")}</a>
            </li>
          </ul>
        ) : null}
      </section>

      <section className="claim-steps">
        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Pick a name</strong> — letters, digits, and hyphens only (e.g.{" "}
            <code>kevin</code> → <code>kevin.{ENS_BASE}</code>).
          </li>
          <li>
            <strong>Connect wallet</strong> — MetaMask or any browser wallet. Your wallet signs the
            profile; Gridz never holds your key.
          </li>
          <li>
            <strong>Fill your profile</strong> — display name, bio, website. Add widgets later via the
            editor or CLI.
          </li>
          <li>
            <strong>Sign &amp; publish</strong> — your signature is stored in each cell&apos;s
            attestation. Publish writes to ENS via the Gridz registrar (EAS + resolver).
          </li>
          <li>
            <strong>Share</strong> — <code>you.{SITE_DOMAIN}</code> goes live within a minute.
          </li>
        </ol>
        <p className="claim-note">
          Names are first-come on the shared <code>gridz.eth</code> namespace. If someone already
          published <code>yourname.{ENS_BASE}</code>, pick another alias or edit the existing profile
          if it&apos;s yours.
        </p>
      </section>

      <p className="claim-more">
        <Link href="/docs/claim">Full claiming guide</Link> · <Link href="/docs">Documentation</Link>
      </p>
    </div>
  );
}

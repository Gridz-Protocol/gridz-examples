"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listMyProfileSubjects } from "../lib/listMyProfiles";
import { useWallet } from "../lib/wallet";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export function MyProfilesMenu() {
  const { address, targetChainId } = useWallet();
  const registrarAddress = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS ?? "";
  const [drafts, setDrafts] = useState<string[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const { drafts: draftList, owned: ownedList } = listMyProfileSubjects({
      walletAddress: address,
      chainId: targetChainId,
      registrarAddress,
    });
    setDrafts(draftList);
    setOwned(ownedList);
  }, [open, address, targetChainId, registrarAddress]);

  if (drafts.length === 0 && owned.length === 0) return null;

  return (
    <div className="my-profiles">
      <button type="button" className="site-btn site-btn--ghost" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        My profiles
      </button>
      {open ? (
        <div className="my-profiles__menu" role="menu">
          {drafts.length > 0 ? <p className="my-profiles__label">Drafts (this browser)</p> : null}
          {drafts.map((subject) => (
            <Link key={`d-${subject}`} href={`/${encodeURIComponent(subject)}`} className="my-profiles__item" onClick={() => setOpen(false)}>
              <span>{subject.split(".")[0]}</span>
              <span className="site-badge site-badge--draft">Draft</span>
            </Link>
          ))}
          {owned.length > 0 ? <p className="my-profiles__label">Yours</p> : null}
          {owned.map((subject) => (
            <Link key={`o-${subject}`} href={`/${encodeURIComponent(subject)}`} className="my-profiles__item" onClick={() => setOpen(false)}>
              <span>{subject.split(".")[0]}</span>
              <span className="site-badge site-badge--live">On-chain</span>
            </Link>
          ))}
          <Link href="/find" className="my-profiles__footer" onClick={() => setOpen(false)}>
            Find another profile →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

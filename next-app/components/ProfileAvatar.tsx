"use client";

import Image from "next/image";
import { useState } from "react";
import { canOptimizeAvatarUrl, resolveAvatarUrl } from "../lib/avatarImage";

export interface ProfileAvatarProps {
  src: string | undefined;
  fallbackLetter: string;
  size?: number;
  className?: string;
}

export function ProfileAvatar({
  src,
  fallbackLetter,
  size = 88,
  className = "spritz-hero__avatar",
}: ProfileAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const resolved = resolveAvatarUrl(src);
  const optimized = resolved ? canOptimizeAvatarUrl(resolved) : false;
  const imgClass = `profile-avatar__img${loaded ? " profile-avatar__img--loaded" : ""}`;

  return (
    <div className={className}>
      <span className="profile-avatar__fallback" aria-hidden>
        {fallbackLetter.slice(0, 1).toUpperCase()}
      </span>
      {resolved && optimized ? (
        <Image
          src={resolved}
          alt=""
          width={size}
          height={size}
          sizes={`${size}px`}
          priority
          className={imgClass}
          onLoad={() => setLoaded(true)}
        />
      ) : resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt=""
          width={size}
          height={size}
          decoding="async"
          fetchPriority="high"
          className={imgClass}
          onLoad={() => setLoaded(true)}
        />
      ) : null}
    </div>
  );
}

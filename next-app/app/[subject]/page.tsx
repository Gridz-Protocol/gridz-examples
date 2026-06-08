import { getImageProps } from "next/image";
import { canOptimizeAvatarUrl, resolveAvatarUrl } from "../../lib/avatarImage";
import { demoAvatarForDisplay } from "../../lib/demoProfile";
import { headerFromGrid } from "../../lib/profileLayout";
import { loadGrid } from "../../lib/loadGrid";
import { ProfilePage } from "../../components/ProfilePage";

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);
  const alias = decoded.split(".")[0] ?? decoded;
  return { title: alias };
}

function avatarPreloadHref(chainGrid: Awaited<ReturnType<typeof loadGrid>>, subject: string): string | undefined {
  if (!chainGrid) return undefined;
  const avatar = demoAvatarForDisplay(subject, headerFromGrid(chainGrid, subject).avatar);
  const resolved = resolveAvatarUrl(avatar);
  if (!resolved) return undefined;
  if (canOptimizeAvatarUrl(resolved)) {
    const { props } = getImageProps({ alt: "", width: 88, height: 88, priority: true, src: resolved });
    return typeof props.src === "string" ? props.src : undefined;
  }
  return resolved;
}

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ claim?: string }>;
}) {
  const { subject } = await params;
  const { claim } = await searchParams;
  const decoded = decodeURIComponent(subject);
  const chainGrid = await loadGrid(decoded);
  const preloadAvatar = avatarPreloadHref(chainGrid, decoded);

  return (
    <>
      {preloadAvatar ? (
        <link rel="preload" as="image" href={preloadAvatar} fetchPriority="high" />
      ) : null}
      <ProfilePage subject={decoded} chainGrid={chainGrid} startClaiming={claim === "1"} />
    </>
  );
}

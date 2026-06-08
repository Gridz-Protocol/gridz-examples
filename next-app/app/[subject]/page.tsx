import { loadGrid } from "../../lib/loadGrid";
import { ProfilePage } from "../../components/ProfilePage";

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);
  const alias = decoded.split(".")[0] ?? decoded;
  return { title: alias };
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
  return <ProfilePage subject={decoded} chainGrid={chainGrid} startClaiming={claim === "1"} />;
}

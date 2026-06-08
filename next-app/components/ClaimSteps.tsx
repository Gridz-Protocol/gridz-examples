const SITE = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export function ClaimSteps({ ensName }: { ensName: string }) {
  const alias = ensName.split(".")[0];

  return (
    <div className="claim-steps-inline">
      <h3>Claim {alias}</h3>
      <ol>
        <li>
          <strong>Connect wallet</strong> (top right)
        </li>
        <li>Fill your profile below</li>
        <li>
          <strong>Publish to ENS</strong> — goes live at{" "}
          <code>
            {alias}.{SITE}
          </code>
        </li>
      </ol>
    </div>
  );
}

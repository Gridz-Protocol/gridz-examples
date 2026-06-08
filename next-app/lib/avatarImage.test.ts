import { describe, expect, it } from "vitest";
import { canOptimizeAvatarUrl, resolveAvatarUrl } from "./avatarImage";

describe("resolveAvatarUrl", () => {
  it("passes through https URLs", () => {
    expect(resolveAvatarUrl("https://gateway.pinata.cloud/ipfs/Qmabc")).toBe(
      "https://gateway.pinata.cloud/ipfs/Qmabc",
    );
  });

  it("resolves ipfs:// to gateway", () => {
    expect(resolveAvatarUrl("ipfs://Qmabc")).toBe("https://gateway.pinata.cloud/ipfs/Qmabc");
  });
});

describe("canOptimizeAvatarUrl", () => {
  it("allows Pinata and Wikimedia", () => {
    expect(canOptimizeAvatarUrl("https://gateway.pinata.cloud/ipfs/Qmabc")).toBe(true);
    expect(
      canOptimizeAvatarUrl(
        "https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg",
      ),
    ).toBe(true);
  });

  it("rejects unknown hosts", () => {
    expect(canOptimizeAvatarUrl("https://example.com/photo.jpg")).toBe(false);
  });
});

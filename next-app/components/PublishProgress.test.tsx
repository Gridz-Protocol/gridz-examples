import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublishProgress } from "./PublishProgress";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("PublishProgress", () => {
  it("shows signing copy and marks Signed step active", () => {
    render(<PublishProgress phase="signing" ensName="demo.gridz.eth" cellCount={3} />);
    expect(screen.getByText("Signing your profile")).toBeTruthy();
    expect(screen.getByText("Signed")).toBeTruthy();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("shows publishing progress and ETA", () => {
    render(<PublishProgress phase="publishing" ensName="alice.eth" cellCount={5} />);
    expect(screen.getByText("Publishing to Ethereum")).toBeTruthy();
    expect(screen.getByText(/Confirm ~10 Ethereum transactions/)).toBeTruthy();
  });

  it("shows success with profile link", () => {
    render(
      <PublishProgress phase="success" ensName="demo.gridz.eth" cellCount={2} txCount={4} />,
    );
    expect(screen.getByText("Profile published")).toBeTruthy();
    const link = screen.getByRole("link", { name: "View profile" });
    expect(link.getAttribute("href")).toBe("/demo.gridz.eth");
  });

  it("shows error with message and dismiss", () => {
    const onDismiss = vi.fn();
    render(
      <PublishProgress
        phase="error"
        ensName="bob.eth"
        errorMessage="Registrar rejected tx"
        draftSaved
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByText("Publish didn't finish")).toBeTruthy();
    expect(screen.getByText("Registrar rejected tx")).toBeTruthy();
    screen.getByRole("button", { name: "Dismiss" }).click();
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

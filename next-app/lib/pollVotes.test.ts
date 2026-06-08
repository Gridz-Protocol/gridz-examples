import { describe, expect, it, beforeEach } from "vitest";
import { getLocalPollVote, setLocalPollVote } from "./pollVotes";

describe("pollVotes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and reads a local poll vote", () => {
    setLocalPollVote("demo.gridz.eth", "gridz.poll", 2);
    expect(getLocalPollVote("demo.gridz.eth", "gridz.poll")).toBe(2);
  });
});

"use client";

import { useEffect, useState } from "react";
import type { Grid, GridVerifyResult } from "@gridz/core";
import type { BadgeStatus, GridVerification } from "@gridz/react";
import { profileVerifyApiUrl } from "./profileVerifyGuide";

const IDLE: GridVerification = {
  loading: true,
  cells: {},
  root: "loading",
  report: null,
  ok: false,
};

/** Published profiles verify via server API — browsers cannot call Base RPC (CORS). */
export function useServerVerification(subject: string, enabled = true): GridVerification {
  const [state, setState] = useState<GridVerification>(
    enabled ? IDLE : { loading: false, cells: {}, root: "unsupported", report: null, ok: false },
  );

  useEffect(() => {
    if (!enabled) {
      setState({ loading: false, cells: {}, root: "unsupported", report: null, ok: false });
      return;
    }

    let cancelled = false;
    setState(IDLE);

    fetch(profileVerifyApiUrl(subject))
      .then(async (res) => {
        const data = (await res.json()) as {
          report?: GridVerifyResult;
          error?: string;
        };
        if (!data.report) {
          throw new Error(data.error ?? "Verification unavailable");
        }
        if (cancelled) return;
        const r = data.report;
        const cells: Record<string, BadgeStatus> = {};
        for (const c of r.cells) cells[c.id] = c.result.status;
        setState({ loading: false, cells, root: r.root.status, report: r, ok: r.ok });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ loading: false, cells: {}, root: "failed", report: null, ok: false });
      });

    return () => {
      cancelled = true;
    };
  }, [subject, enabled]);

  return state;
}

export function gridHasEasCells(grid: Grid): boolean {
  return grid.cells.some((c) => c.attestation?.format === "eas-onchain");
}

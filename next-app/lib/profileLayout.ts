import type { Cell, Grid } from "@gridz/core";

export const HEADER_KEYS = new Set([
  "alias",
  "description",
  "display",
  "avatar",
  "header",
  "url",
  "theme",
  "timezone",
  "gridz.subject",
  "gridz.theme",
  "gridz.root",
  "gridz.keys",
  "gridz.layout",
]);

export function cellValue(grid: Grid, key: string): string | undefined {
  const v = grid.cells.find((c) => c.key === key)?.value;
  return typeof v === "string" ? v : v != null ? JSON.stringify(v) : undefined;
}

export function headerFromGrid(grid: Grid, subject: string) {
  const alias = cellValue(grid, "alias") ?? grid.subject.display_name ?? subject.split(".")[0];
  const description = cellValue(grid, "description") ?? "";
  const url = cellValue(grid, "url");
  const avatar = cellValue(grid, "avatar");
  const header = cellValue(grid, "header");
  const handle = subject.includes(".") ? `@${subject.split(".")[0]}` : subject;
  return { alias, description, url, avatar, header, handle, subject };
}

export function isSocialKey(key: string): boolean {
  return key.includes(".") && !key.startsWith("gridz.") && !HEADER_KEYS.has(key);
}

export function widgetCells(grid: Grid): Cell[] {
  return grid.cells
    .filter((c) => c.is_visible && !HEADER_KEYS.has(c.key) && !isSocialKey(c.key) && c.key !== "gridz.message_me")
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
}

export function socialCells(grid: Grid): Cell[] {
  return grid.cells.filter((c) => c.is_visible && isSocialKey(c.key));
}

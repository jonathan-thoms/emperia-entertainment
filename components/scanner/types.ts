// ── Scanner shared types ────────────────────────────────────────────────────────

export type ScanState = "idle" | "scanning" | "valid" | "invalid";

export type ScanResult = {
  status: "success" | "error";
  message: string;
  detail?: string;
};

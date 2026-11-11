import { baseConfig } from "./kinds";
import type { DesignConfig } from "./types";

/** Konfigurasi → string URL-safe (untuk tautan desain). */
export function encodeConfig(config: DesignConfig): string {
  const json = JSON.stringify(config);
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeConfig(token: string | undefined | null): DesignConfig | null {
  if (!token || token.length > 6000) return null;
  try {
    const pad = token.length % 4 === 0 ? "" : "=".repeat(4 - (token.length % 4));
    const json = atob(token.replace(/-/g, "+").replace(/_/g, "/") + pad);
    const parsed = JSON.parse(json) as Partial<DesignConfig>;
    if (!parsed || typeof parsed !== "object") return null;
    const merged = { ...baseConfig(), ...parsed };
    if (!Array.isArray(merged.columns)) merged.columns = [];
    return merged;
  } catch {
    return null;
  }
}

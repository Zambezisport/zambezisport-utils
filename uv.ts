/**
 * uv.ts — WHO Global Solar UV Index bands and protection guidance.
 *
 * UV index is dimensionless; erythemally-weighted irradiance × 40.
 * Band thresholds follow WHO/WMO/ICNIRP convention.
 */

export type UvBand = "low" | "moderate" | "high" | "very-high" | "extreme";

export interface UvResult {
  index: number;
  band: UvBand;
  /** Minutes of midday sun a fair-skinned person can take before damage (rough). */
  burnMinutes: number;
  protection: string;
}

const BANDS: Array<{ max: number; band: UvBand; burnMinutes: number; protection: string }> = [
  {
    max: 2,
    band: "low",
    burnMinutes: 60,
    protection: "No protection needed for most; sunglasses on bright days.",
  },
  {
    max: 5,
    band: "moderate",
    burnMinutes: 45,
    protection: "SPF 30+ if outdoors >30 min; seek shade late morning.",
  },
  {
    max: 7,
    band: "high",
    burnMinutes: 25,
    protection: "SPF 30+, hat, long sleeves; shade 10:00–16:00. Reapply sunscreen hourly when sweating.",
  },
  {
    max: 10,
    band: "very-high",
    burnMinutes: 15,
    protection: "Minimise midday exposure; full cover + SPF 50+. Schedule training early/late.",
  },
  {
    max: Infinity,
    band: "extreme",
    burnMinutes: 10,
    protection: "Avoid outdoor exposure 10:00–16:00 entirely where possible.",
  },
];

export function assessUv(index: number): UvResult {
  const idx = Math.max(0, index);
  const b = BANDS.find((b) => idx <= b.max)!;
  return { index: idx, band: b.band, burnMinutes: b.burnMinutes, protection: b.protection };
}

/**
 * Whether an outdoor session starting at `hourLocal` (0–23) with the given
 * duration should prefer rescheduling, at the given UV index.
 */
export function uvWindowAdvice(index: number, hourLocal: number, durationMin: number): string | null {
  const { band } = assessUv(index);
  if (band === "low" || band === "moderate") return null;
  const endHour = hourLocal + durationMin / 60;
  const overlapsPeak = hourLocal < 16 && endHour > 10;
  if (!overlapsPeak) return null;
  if (band === "high")
    return "Peak UV window — enforce sunscreen, shade breaks and hydration.";
  return "Session overlaps peak UV — start before 10:00 or after 16:00.";
}

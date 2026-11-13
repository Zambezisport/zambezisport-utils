/**
 * aqi.ts — US EPA Air Quality Index from PM2.5 / PM10 concentration,
 * plus exercise guidance.
 *
 * AQI is a piecewise-linear index: each pollutant concentration maps
 * onto 0–500 via published breakpoints. The reported AQI is the worst
 * (highest) sub-index across pollutants.
 *
 * Planning aid — local regulatory breakpoints may differ.
 */

export interface Breakpoint {
  cLow: number;
  cHigh: number;
  aqiLow: number;
  aqiHigh: number;
}

/** 24-h PM2.5 breakpoints, µg/m³ (US EPA). */
export const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, aqiLow: 0, aqiHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, aqiLow: 301, aqiHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, aqiLow: 401, aqiHigh: 500 },
];

/** 24-h PM10 breakpoints, µg/m³. */
export const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, aqiLow: 0, aqiHigh: 50 },
  { cLow: 55, cHigh: 154, aqiLow: 51, aqiHigh: 100 },
  { cLow: 155, cHigh: 254, aqiLow: 101, aqiHigh: 150 },
  { cLow: 255, cHigh: 354, aqiLow: 151, aqiHigh: 200 },
  { cLow: 355, cHigh: 424, aqiLow: 201, aqiHigh: 300 },
  { cLow: 425, cHigh: 504, aqiLow: 301, aqiHigh: 400 },
  { cLow: 505, cHigh: 604, aqiLow: 401, aqiHigh: 500 },
];

export type AqiCategory =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

/** Linear-interpolate a concentration onto the AQI scale. */
export function concentrationToAqi(c: number, table: Breakpoint[]): number | null {
  const bp = table.find((b) => c >= b.cLow && c <= b.cHigh);
  if (!bp) return c > table[table.length - 1].cHigh ? 500 : null;
  const aqi =
    ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.aqiLow;
  return Math.round(aqi);
}

export function aqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy-sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

const EXERCISE_GUIDANCE: Record<AqiCategory, string> = {
  good: "Train outdoors normally.",
  moderate: "Unusually sensitive individuals consider lighter sessions.",
  "unhealthy-sensitive": "Sensitive groups (asthma, juniors) move indoors; others reduce intensity.",
  unhealthy: "Move training indoors or reschedule; avoid prolonged exertion outdoors.",
  "very-unhealthy": "No outdoor training. Indoor facilities with filtered air only.",
  hazardous: "No outdoor activity. Event cancellation advised.",
};

export interface AqiResult {
  aqi: number;
  dominant: "pm25" | "pm10" | null;
  category: AqiCategory;
  exerciseGuidance: string;
}

/** Combined AQI from available pollutant measurements. */
export function assessAir(input: { pm25?: number; pm10?: number }): AqiResult | null {
  const candidates: Array<{ pollutant: "pm25" | "pm10"; aqi: number }> = [];
  if (input.pm25 != null) {
    const aqi = concentrationToAqi(input.pm25, PM25_BREAKPOINTS);
    if (aqi != null) candidates.push({ pollutant: "pm25", aqi });
  }
  if (input.pm10 != null) {
    const aqi = concentrationToAqi(input.pm10, PM10_BREAKPOINTS);
    if (aqi != null) candidates.push({ pollutant: "pm10", aqi });
  }
  if (candidates.length === 0) return null;
  const worst = candidates.reduce((a, b) => (b.aqi > a.aqi ? b : a));
  const category = aqiCategory(worst.aqi);
  return {
    aqi: worst.aqi,
    dominant: worst.pollutant,
    category,
    exerciseGuidance: EXERCISE_GUIDANCE[category],
  };
}

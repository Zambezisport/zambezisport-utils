/**
 * wbgt.ts — Wet-Bulb Globe Temperature estimate and activity risk bands.
 *
 * WBGT is the standard heat-stress index for outdoor sport and work
 * (ACSM, World Athletics, FIFA). True WBGT needs a globe thermometer;
 * this estimates it from air temperature, relative humidity and sun
 * exposure — the approximation used by the Australian Bureau of
 * Meteorology, ±~1 °C in shade, conservative in sun.
 *
 * Planning aid, not a medical device.
 */

export interface WbgtInput {
  /** Air (dry-bulb) temperature, °C. */
  tempC: number;
  /** Relative humidity, 0–100 %. */
  rhPct: number;
  /** Direct sun exposure (raises globe temperature). Default true. */
  inSun?: boolean;
  /** Wind speed, m/s — cooling reduces effective load. Default 1. */
  windMps?: number;
}

export type WbgtBand = "low" | "moderate" | "high" | "very-high" | "extreme";

export interface WbgtResult {
  wbgtC: number;
  band: WbgtBand;
  guidance: string;
}

/** Saturated vapour pressure over water, hPa (Bolton 1980). */
export function saturationVapourPressureHpa(tempC: number): number {
  return 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
}

/**
 * Approximate outdoor WBGT in °C.
 * Shade: 0.567·Ta + 0.393·e + 3.94 (ABM approximation).
 * Sun:   add a solar load term approximating the globe's radiative gain.
 */
export function wbgtApprox({ tempC, rhPct, inSun = true, windMps = 1 }: WbgtInput): number {
  const e = (rhPct / 100) * saturationVapourPressureHpa(tempC);
  let wbgt = 0.567 * tempC + 0.393 * e + 3.94;
  if (inSun) wbgt += 3.0; // radiative load, calm-to-light air
  // Wind cooling: each m/s above 3 knocks back the solar term a little.
  if (windMps > 3) wbgt -= Math.min(2.0, (windMps - 3) * 0.5);
  return Math.round(wbgt * 10) / 10;
}

const GUIDANCE: Record<WbgtBand, string> = {
  low: "Normal activity. Standard hydration plan.",
  moderate: "Caution. Extend warm-up gradually; fluids available; watch at-risk individuals.",
  high: "Modify. Shorten session, add rest breaks in shade, schedule outside peak heat.",
  "very-high": "High risk. Move indoors or reschedule; if it must run, max 1h with enforced cooling breaks.",
  extreme: "Cancel or postpone. Risk of exertional heat illness even in fit athletes.",
};

/** ACSM-style risk bands for continuous outdoor activity. */
export function wbgtBand(wbgtC: number): WbgtBand {
  if (wbgtC < 18) return "low";
  if (wbgtC < 23) return "moderate";
  if (wbgtC < 26) return "high";
  if (wbgtC < 30) return "very-high";
  return "extreme";
}

export function assessHeat(input: WbgtInput): WbgtResult {
  const wbgtC = wbgtApprox(input);
  const band = wbgtBand(wbgtC);
  return { wbgtC, band, guidance: GUIDANCE[band] };
}

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
  /**
   * Full racing gear or sealed cockpit: limits evaporative cooling and traps
   * metabolic heat. Effective strain is ~2 °C WBGT above ambient conditions.
   */
  heavyGear?: boolean;
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
export function wbgtApprox({ tempC, rhPct, inSun = true, windMps = 1, heavyGear = false }: WbgtInput): number {
  const e = (rhPct / 100) * saturationVapourPressureHpa(tempC);
  let wbgt = 0.567 * tempC + 0.393 * e + 3.94;
  if (inSun) wbgt += 3.0; // radiative load, calm-to-light air
  // Wind cooling: each m/s above 3 knocks back the solar term a little.
  if (windMps > 3) wbgt -= Math.min(2.0, (windMps - 3) * 0.5);
  if (heavyGear) wbgt += 2.0; // gear/cockpit blocks evaporative + convective loss
  return Math.round(wbgt * 10) / 10;
}

const GUIDANCE: Record<WbgtBand, string> = {
  low: "Normal running. Standard drink-system plan per stint.",
  moderate: "Caution. Cooling vests recommended; fluids at every service point; watch riders flagged for heat issues.",
  high: "Shorten stints. Enforced shaded stops between sections; pre-cool drivers before the stage.",
  "very-high": "High risk. Split the stage or delay to cooler hours; if it must run, cap stints at 1h with enforced cooling stops.",
  extreme: "Cancel or postpone the stage. Risk of exertional heat illness even in fit, acclimatised drivers.",
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

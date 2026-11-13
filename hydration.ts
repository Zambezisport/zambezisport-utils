/**
 * hydration.ts — fluid and sodium planning for outdoor sessions.
 *
 * Sweat rate scales with exercise intensity and heat; sodium loss scales
 * with sweat. Planning targets follow common sports-medicine guidance:
 * replace ~80–100 % of expected losses during long/hot sessions without
 * exceeding ~1 L/h intake, and pre-load when conditions are severe.
 */

export type Intensity = "low" | "moderate" | "high" | "max";

export interface HydrationInput {
  /** Athlete body mass, kg. */
  massKg: number;
  durationMin: number;
  intensity: Intensity;
  /** Air temperature °C — drives sweat rate above ~20 °C. */
  tempC: number;
  rhPct?: number;
}

export interface HydrationPlan {
  /** Estimated sweat loss for the session, litres. */
  sweatL: number;
  /** Fluid to carry / have available, litres. */
  carryL: number;
  /** Target intake rate, ml per 15 min during the session. */
  per15MinMl: number;
  /** Sodium replacement target, mg (roughly 1 g salt ≈ 400 mg Na). */
  sodiumMg: number;
  /** Pre-session drink, ml (~5–7 ml/kg in the hours before, capped). */
  preloadMl: number;
  notes: string[];
}

/** Base sweat rate L/h by intensity at ~20 °C reference. */
const BASE_SWEAT_LPH: Record<Intensity, number> = {
  low: 0.4,
  moderate: 0.8,
  high: 1.2,
  max: 1.8,
};

export function planHydration(input: HydrationInput): HydrationPlan {
  const { massKg, durationMin, intensity, tempC, rhPct = 50 } = input;
  const hours = durationMin / 60;

  // Heat multiplier: +8 % per °C above 20, humidity adds up to +25 %.
  const heatFactor = 1 + Math.max(0, tempC - 20) * 0.08;
  const humidFactor = 1 + Math.max(0, rhPct - 60) / 100 * 0.25;
  // Mass scaling around a 70 kg reference.
  const massFactor = massKg / 70;

  const sweatLph = BASE_SWEAT_LPH[intensity] * heatFactor * humidFactor * massFactor;
  const sweatL = sweatLph * hours;

  // Replace most losses but cap intake at ~1 L/h — gut absorption limit.
  const intakeLph = Math.min(1.0, sweatLph);
  const carryL = Math.min(sweatL, intakeLph * hours);
  const per15MinMl = Math.round((intakeLph / 4) * 1000);

  // ~1 g NaCl lost per litre of sweat → ~400 mg Na per litre.
  const sodiumMg = Math.round(sweatL * 400);
  const preloadMl = Math.min(700, Math.round(massKg * 6));

  const notes: string[] = [];
  if (sweatLph > 1.0) notes.push("Sweat rate exceeds intake capacity — plan cooling breaks, not just fluids.");
  if (tempC >= 30) notes.push("Chill fluids where possible — improves intake and core cooling.");
  if (hours >= 1.5) notes.push("Include carbohydrate-electrolyte mix after the first hour.");

  return {
    sweatL: Math.round(sweatL * 100) / 100,
    carryL: Math.round(carryL * 100) / 100,
    per15MinMl,
    sodiumMg,
    preloadMl,
    notes,
  };
}

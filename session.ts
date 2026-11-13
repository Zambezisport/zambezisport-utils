/**
 * session.ts — composite stage advisory for desert motorsport.
 *
 * Combines heat (WBGT, gear-adjusted), air quality (AQI / dust) and UV into a
 * single run / caution / shorten / cancel verdict with reasons.
 * The worst sub-score wins — conditions are only as good as the
 * weakest factor.
 */

import { assessHeat, type WbgtInput } from "./wbgt";
import { assessAir } from "./aqi";
import { assessUv, uvWindowAdvice } from "./uv";

export type Verdict = "go" | "caution" | "modify" | "cancel";

export interface SessionInput extends WbgtInput {
  /** Stage start, local hour 0–23. */
  startHourLocal: number;
  /** Stage duration — use expected elapsed time, not distance. */
  durationMin: number;
  pm25?: number;
  pm10?: number;
  uvIndex?: number;
}

export interface SessionAdvisory {
  verdict: Verdict;
  reasons: string[];
  tips: string[];
  detail: {
    wbgtC?: number;
    aqi?: number;
    uvIndex?: number;
  };
}

const VERDICT_ORDER: Verdict[] = ["go", "caution", "modify", "cancel"];
const worst = (v: Verdict[]): Verdict =>
  v.reduce((a, b) => (VERDICT_ORDER.indexOf(b) > VERDICT_ORDER.indexOf(a) ? b : a));

export function sessionAdvisory(input: SessionInput): SessionAdvisory {
  const reasons: string[] = [];
  const tips: string[] = [];
  const verdicts: Verdict[] = [];
  const detail: SessionAdvisory["detail"] = {};

  // Heat
  const heat = assessHeat(input);
  detail.wbgtC = heat.wbgtC;
  switch (heat.band) {
    case "low":
      verdicts.push("go");
      break;
    case "moderate":
      verdicts.push("caution");
      reasons.push(`WBGT ${heat.wbgtC} °C — moderate heat load`);
      break;
    case "high":
      verdicts.push("modify");
      reasons.push(`WBGT ${heat.wbgtC} °C — high heat stress`);
      break;
    default:
      verdicts.push("cancel");
      reasons.push(`WBGT ${heat.wbgtC} °C — extreme heat stress`);
  }
  tips.push(heat.guidance);

  // Air
  const air = assessAir({ pm25: input.pm25, pm10: input.pm10 });
  if (air) {
    detail.aqi = air.aqi;
    if (air.aqi <= 100) {
      verdicts.push("go");
    } else if (air.aqi <= 150) {
      verdicts.push("caution");
      reasons.push(`AQI ${air.aqi} (${air.dominant}) — unhealthy for sensitive groups`);
    } else if (air.aqi <= 200) {
      verdicts.push("modify");
      reasons.push(`AQI ${air.aqi} (${air.dominant}) — unhealthy`);
    } else {
      verdicts.push("cancel");
      reasons.push(`AQI ${air.aqi} (${air.dominant}) — very unhealthy / hazardous`);
    }
    tips.push(air.exerciseGuidance);
  }

  // UV
  if (input.uvIndex != null) {
    detail.uvIndex = input.uvIndex;
    const uv = assessUv(input.uvIndex);
    const windowNote = uvWindowAdvice(input.uvIndex, input.startHourLocal, input.durationMin);
    if (uv.band === "very-high" || uv.band === "extreme") {
      verdicts.push("caution");
      reasons.push(`UV index ${input.uvIndex} — ${uv.band} (typical open-desert load)`);
    }
    if (windowNote) tips.push(windowNote);
    tips.push(uv.protection);
  }

  return { verdict: worst(verdicts), reasons, tips, detail };
}

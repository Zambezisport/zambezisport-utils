# zambezisport-utils

**English** | [Português](README.pt.md)

Small dependency-free TypeScript utilities for environmental health in desert
motorsport, from [**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| file | what it is |
|---|---|
| [`wbgt.ts`](wbgt.ts) | Heat stress for drivers & riders — WBGT estimate adjusted for full racing gear / sealed cockpit |
| [`aqi.ts`](aqi.ts) | US EPA AQI from PM2.5 / PM10 — dust conditions with stage guidance (riders + engine intake) |
| [`uv.ts`](uv.ts) | WHO UV-index bands and peak-window advice for open-desert stages |
| [`hydration.ts`](hydration.ts) | Sweat-rate, drink-system carry, intake-rate and sodium targets per stint |
| [`session.ts`](session.ts) | Composite run / caution / shorten / cancel verdict combining heat, dust and UV |

```ts
import { sessionAdvisory } from "./session"

sessionAdvisory({
  tempC: 38, rhPct: 12, inSun: true, heavyGear: true,
  startHourLocal: 11, durationMin: 240,
  pm10: 180, uvIndex: 11,
})
// → { verdict: "cancel",
//     reasons: ["WBGT ~35 °C — extreme heat stress",
//               "AQI ~154 (pm10) — unhealthy",
//               "UV index 11 — extreme (typical open-desert load)"], … }
```

Planning aids for race control — final calls belong to event direction and
medical staff. MIT licensed.

# zambezisport-utils

**English** | [Português](README.pt.md)

Small dependency-free TypeScript utilities for environmental health and outdoor
sport, from [**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| file | what it is |
|---|---|
| [`wbgt.ts`](wbgt.ts) | Wet-bulb globe temperature estimate (temp + humidity + sun) and ACSM-style activity risk bands |
| [`aqi.ts`](aqi.ts) | US EPA AQI from PM2.5 / PM10 concentration, category bands and exercise guidance |
| [`uv.ts`](uv.ts) | WHO UV-index bands, burn-time estimates and peak-window advice |
| [`hydration.ts`](hydration.ts) | Sweat-rate, fluid-carry, intake-rate and sodium targets for a session |
| [`session.ts`](session.ts) | Composite go / caution / modify / cancel verdict combining heat, air and UV |

```ts
import { sessionAdvisory } from "./session"

sessionAdvisory({
  tempC: 34, rhPct: 45, inSun: true,
  startHourLocal: 14, durationMin: 90,
  pm25: 28, uvIndex: 9,
})
// → { verdict: "cancel",
//     reasons: ["WBGT ~30 °C — extreme heat stress",
//               "UV index 9 — very-high"],
//     tips: ["Cancel or postpone. Risk of exertional heat illness…", …] }
```

Planning aids, not medical advice — always defer to local health guidance and
event medical staff. MIT licensed.

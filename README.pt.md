# zambezisport-utils

[English](README.md) | **Português**

Pequenos utilitários TypeScript sem dependências para saúde ambiental no
desporto motorizado no deserto, da [**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| ficheiro | o que é |
|---|---|
| [`wbgt.ts`](wbgt.ts) | Stress térmico para pilotos — WBGT ajustado ao fato de corrida / cockpit selado |
| [`aqi.ts`](aqi.ts) | AQI EPA de PM2.5 / PM10 — condições de poeira com orientação por etapa (pilotos + admissão do motor) |
| [`uv.ts`](uv.ts) | Bandas de índice UV da OMS e conselhos de horário para etapas em deserto aberto |
| [`hydration.ts`](hydration.ts) | Taxa de suor, fluido no sistema de hidratação, ritmo de ingestão e metas de sódio por stint |
| [`session.ts`](session.ts) | Veredicto composto correr / cautela / encurtar / cancelar combinando calor, poeira e UV |

```ts
import { sessionAdvisory } from "./session"

sessionAdvisory({
  tempC: 38, rhPct: 12, inSun: true, heavyGear: true,
  startHourLocal: 11, durationMin: 240,
  pm10: 180, uvIndex: 11,
})
// → { verdict: "cancel", reasons: […], tips: […] }
```

Ferramentas de planeamento para a direção de prova — a decisão final cabe à
organização e à equipa médica. Licença MIT.

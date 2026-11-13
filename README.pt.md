# zambezisport-utils

[English](README.md) | **Português**

Pequenos utilitários TypeScript sem dependências para saúde ambiental e desporto
ao ar livre, da [**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| ficheiro | o que é |
|---|---|
| [`wbgt.ts`](wbgt.ts) | Estimativa de temperatura de globo de bulbo húmido (temperatura + humidade + sol) e bandas de risco de atividade |
| [`aqi.ts`](aqi.ts) | Índice de qualidade do ar EPA a partir de PM2.5 / PM10, bandas e orientação para exercício |
| [`uv.ts`](uv.ts) | Bandas de índice UV da OMS, estimativa de tempo até queimadura e conselhos sobre horários de pico |
| [`hydration.ts`](hydration.ts) | Taxa de suor, fluido a transportar, ritmo de ingestão e metas de sódio por sessão |
| [`session.ts`](session.ts) | Veredicto composto avançar / cautela / adaptar / cancelar combinando calor, ar e UV |

```ts
import { sessionAdvisory } from "./session"

sessionAdvisory({
  tempC: 34, rhPct: 45, inSun: true,
  startHourLocal: 14, durationMin: 90,
  pm25: 28, uvIndex: 9,
})
// → { verdict: "cancel", reasons: […], tips: […] }
```

Ferramentas de planeamento, não aconselhamento médico — seguir sempre as
orientações de saúde locais e a equipa médica do evento. Licença MIT.

# Rediseño 2026 — Changelog

Big-bang redesign aplicado en branch `redesign-2026` durante mayo 2026.
9 commits convencionales + 1 chore previo de hygiene de lint.

El plan maestro completo (1190 líneas con investigación, decisiones de
producto, riesgos y mitigaciones) vive en `redesign-2026-plan.md`.

---

## Decisiones de producto

| Decisión | Resultado |
|---|---|
| Branding | Chrome neutro + acento por tenant. HUB usa `--tenant-accent = primary`. Sistema theming-ready vía `tenants.theme jsonb` (futuro). |
| Navegación | Workspaces por rol. Login redirige (proxy.ts). Owner → manager, staff → salón. |
| Modo color | Auto (sigue OS) con toggle persistente. Light + Dark a paridad. |
| Personalidad | Híbrido cálido — Fraunces serif en heroes/h1/h2, Inter en UI, motion v15 + View Transitions. |
| Estrategia | Big-bang en una sola PR, 9 commits convencionales. |
| Salón device | Mobile vertical first. Bottom-tab. PWA instalable. |

---

## Commits

| # | Hash | Mensaje |
|---|---|---|
| 0 | `7c32105` | `chore(lint): fix pre-existing biome errors blocking pre-commit` |
| 1 | `9a2867c` | `chore(theme): foundation tokens cream+forest + Fraunces + theme provider` |
| 2 | `9a471dc` | `feat(ui): primitives restyled + new shadcn + custom additions` |
| 3 | `4c3dce6` | `feat(manager): app shell + sidebar 6 dominios + topbar + ⌘K palette` |
| 4 | `4b99c1a` | `feat(manager): IA reagrupada — puntos/punch-cards top-level + config con sub-nav` |
| 5 | `e0b1e42` | `feat(salon): app shell mobile-first + bottom-tab + PWA scaffolding` |
| 6 | `e143e79` | `feat(salon): mesas + cocina con shell mobile + redirects de paths viejos` |
| 7 | `139c924` | `feat(manager): redesign de pages — NumberTicker en KPIs + eyebrows del nuevo IA` |
| 8 | `4203fe5` | `feat(auth): rebrand login + email + redirect-by-role en proxy` |
| 9 | (este) | `chore(docs): design-system + redesign changelog + README` |

Cada commit pasa `typecheck + lint + test:ci` antes del siguiente
(husky pre-commit lo enforce).

---

## Antes / Después — IA

### Antes — 13 secciones top-level

```
Operación   → Resumen, Sesiones, Cocina, Cerrar mesa (legacy),
              Clientes, Eventos, Bandeja
Análisis    → Estadísticas
Marketing   → Audiencias, Difusiones, Flows
Configuración → Menú, Mesas, Puntos, Punch cards, Tags, Auto-aceptación,
              Captura, Canales, Plantillas, Equipo, Preferencias
```

13 items + 9 sub-páginas en Configuración. Sidebar largo, todo mezclado.

### Después — 6 dominios manager + 4 tabs salón

```
MANAGER  /[slug]
  HOY        Resumen · Salón en vivo (newTab) · Bandeja
  CLIENTES   Personas · Audiencias
  MARKETING  Difusiones · Flows · Eventos
  CATÁLOGO   Menú · Puntos · Punch cards
  INSIGHTS   Estadísticas
  AJUSTES    Configuración (4 cards: Equipo · Local · Mensajería · Apariencia)

SALÓN    /[slug]/salon
  Mesas · Cocina · Bandeja · Mi turno
```

`Sesiones` y `Cocina` migran al salón (path `/[slug]/salon/mesas` y
`/[slug]/salon/cocina`). `Puntos` y `Punch cards` suben a top-level.
Configuración se reagrupa en 4 dominios con sub-nav lateral.

Bookmarks viejos siguen vivos via redirects 308 en `next.config.ts`.

---

## Decisiones técnicas no obvias

1. **`next-themes` no instalado** — implementación manual con cookie
   no-httpOnly + script inline `<head>` que evita FOUC. Justificación:
   `next-themes` es overkill (~7kb) y rompe RSC con flash si pref=auto.

2. **`motion` v12 (paquete `motion`, sucesor de `framer-motion`)**.
   Solo se importa en `NumberTicker` por ahora — el resto usa
   tw-animate-css. Bundle impact mínimo (~12kb gzip cuando se carga).

3. **Service worker manual en lugar de Serwist**. Decisión scope:
   sw.js de ~80 LOC cubre el 90% del valor (cache shell, network-first
   HTML, no cache de mutations). Migrar a Serwist queda en BACKLOG si
   crece la complejidad de offline.

4. **Iconos PWA en SVG**. Funcionales para instalación pero Lighthouse
   PWA no llega a 100 sin PNGs reales (192/512/maskable). Anotado en
   BACKLOG.

5. **`lib/supabase/middleware.ts` no se renombra**. Es helper interno
   del adapter Supabase SSR (la convención Next 16 `proxy.ts` ya
   existe en raíz e importa este helper). El validador del plugin
   confunde el nombre del archivo con la convención runtime.

6. **`tenant-switcher` viejo eliminado**. Reemplazado por
   `tenant-switcher-chip` (versión compacta para topbar).

7. **`/visitas` global no aparece en sidebar**. Sin job-to-be-done
   propio: las visitas siempre se llegan via `/clientes/[id]`. Redirect
   307 (no permanent) por si se recupera la sección.

---

## Hallazgos colaterales (BACKLOG)

Descubiertos durante el rediseño, **NO resueltos** acá:

1. `SessionsGrid` y `KdsScreen` re-fetchean GET full en cada cambio
   Realtime (~10 reqs/min con tickets activos). Migrar a optimistic
   local merge del payload Realtime.
2. `updatePasswordAction` no diferencia sesión recovery vs normal —
   un usuario logueado podría cambiarse la pass sin reauth. Riesgo
   bajo, scope auth review futuro.
3. `tenant-switcher-chip` redirige sin verificar que el slug destino
   corresponde al tenant que activó. Seguro hoy (viene de membership)
   pero conviene loguear.
4. PNGs reales para PWA icons (192/512/maskable) — actualmente SVG.
5. Bandeja mobile-first del salón es placeholder. Implementación real
   pendiente (split pane → stack vertical, lista + detalle como rutas
   separadas).
6. `forgot-password`, `update-password`, `accept-invite`, `onboarding`
   heredan visual del rediseño automáticamente pero no fueron
   pulidos individualmente.
7. Cobertura de tests de `lib/theme` es mínima (parser puro). Tests
   de cookie/actions requieren mock de `next/headers` (skipped).

---

## Smoke manual + Lighthouse pendientes

Ver `redesign-2026-plan.md` §7 para los 30 pasos del smoke.
Lighthouse Performance 90+ y PWA 100 son DoD pero requieren correr
contra `npm run start` con device real / DevTools mobile sim.

---

## Cómo revertir

Cada commit es auto-contenido (`git checkout` de cualquier hash
compila + pasa lint/typecheck/tests). Para revertir el redesign
completo:

```bash
git revert --no-commit 4203fe5..7c32105
git commit -m "revert: redesign 2026 (rollback)"
```

O simplemente `git reset --hard 20b3db8` si la branch no está
mergeada todavía.

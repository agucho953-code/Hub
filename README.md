# HUB Platform

CRM multi-tenant para bares — Next.js 16 + Supabase + Tailwind v4.

## Bootstrap

```bash
git clone <repo> hub
cd hub
npm install
cp .env.example .env.local           # completar las variables
npx supabase start                    # levanta Postgres local + Studio
npx supabase db push                  # aplica migraciones
npm run dev                           # http://localhost:3000
```

Después de cada migración nueva regenerá los tipos:

```bash
npm run db:types
```

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Next.js dev (Turbopack, ya es default en Next 16) |
| `npm run build` | Build de producción |
| `npm run start` | Server de producción |
| `npm run lint` | Biome (lint + format check) |
| `npm run lint:fix` | Biome con `--write` |
| `npm run format` | Solo format con Biome |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest watch |
| `npm run test:ci` | Vitest run (single pass) |
| `npm run db:start` / `db:stop` / `db:reset` / `db:push` / `db:diff` | Wrappers de Supabase CLI |
| `npm run db:types` | Regenera `types/database.ts` desde el schema local |

## Estructura

Ver `CLAUDE.md` para la estructura completa, la ley multi-tenant y las convenciones del proyecto.

## Calidad

- **Biome** reemplaza ESLint+Prettier.
- **Husky** corre `typecheck + lint + test:ci` en pre-commit.
- **GitHub Actions** corre los mismos checks en cada PR a `main`.

## Variables de entorno

Ver `.env.example`. Las variables sensibles (`SUPABASE_SERVICE_ROLE_KEY`, `META_TOKEN_KEY`, `META_APP_SECRET`, `CRON_SECRET`) **nunca** se exponen al cliente — el patrón `NEXT_PUBLIC_*` es solo para vars públicas.

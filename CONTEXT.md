# CONTEXT.md — Memoria compartida de Project Gamma

> Resumen vivo del proyecto para agentes de IA. Lo lee `/innit-repo` al inicio de cada sesión y se actualiza al cierre (ver `SKILLS.md`).
> **Límite: ≤ 200 líneas.** Escribe en bullets cortos, sin código ni logs: solo referencias a rutas, commits o PRs.

**Última actualización:** 2026-11-11 — Claude Code

---

## 🎯 Objetivo general

- Plataforma de moda circular para Paraguay (es-PY, PYG ₲) que **conecta compradoras con tiendas**. No es un marketplace transaccional.
- Cada tienda tiene un perfil propio muy personalizable, basado en el funcionamiento de las tiendas de Depop (sin copiar su marca, textos ni diseño).
- La compradora explora varias tiendas, guarda favoritos, sigue tiendas y contacta a la tienda por **WhatsApp**. El pago y el envío se coordinan ahí: **fuera de la plataforma y fuera de nuestra responsabilidad**.
- La plataforma vuelve a intervenir cuando la tienda marca la prenda como vendida (VENDIDO visible, avisos a favoritos).
- Ingresos: suscripción de tiendas (plan Pro) y destacadas pagas. Sin comisión por venta en el MVP.
- Spec vigente: **PRD** en Claude Docs ("PRD: Marketplace de tiendas de moda circular (MVP)", borrador del 2026-11-11). `docs/master-prompt.md` queda como antecedente: su modelo transaccional (bolsa, checkout, envíos, saldos) fue reemplazado.

## 📍 Estado actual

- **Fase:** 0, definición (todavía no hay código).
- **Rama de trabajo:** `main` (al día con `origin/main`, último merge: PR #2).
- **Resumen:** `CLAUDE.md` ya está versionado (PR #2). Se cambió el modelo de producto (ver "Decisiones clave", 2026-11-11) y hay un PRD en borrador. La arquitectura aprobada en T-006 quedó desalineada con el nuevo modelo y debe revisarse antes de escribir código.
- **Desactualizados por el cambio de modelo:** `docs/checklist.md` (fases P2–P4), `docs/arquitectura.md` (pagos, envíos, saldos), `docs/prototipo/index.html` (compra simulada) y el diagrama "Flujo del MVP de Gamma" (artifact).

## 🗺️ Etapas del producto

> Propuesta derivada del PRD; falta la aprobación del usuario y replanificar el checklist (T-040).

| Fase | Alcance | Estado |
|------|---------|--------|
| 0 | PRD, revisión del stack para el nuevo modelo, modelo de datos | En curso: PRD en borrador |
| 1 | **Flujo de punta a punta mínimo:** crear tienda → publicar prenda → descubrir/buscar → página de prenda → ♥ y seguir → "Escribir por WhatsApp" → la tienda marca vendida → VENDIDO visible | Pendiente |
| 2 | Resto del MVP: personalización avanzada de tienda, drops, avisos in-app, alquiler con calendario, consignación y liquidaciones, planes Free/Pro, destacadas, reportes, bloqueo y moderación | Pendiente |
| 3 | Lanzamiento con tiendas piloto, métricas (clicks a WhatsApp vs. ventas marcadas), términos de uso | Pendiente |
| 4+ | App nativa, portal de proveedoras, reseñas, insignias, ¿pago con tarjeta en la app? | Fuera del MVP |

## 🔒 Task bloqueante

> Solo una a la vez. Mientras exista, los agentes no avanzan en otras tasks (ver la "Regla de bloqueo" en `SKILLS.md`).

- **Ninguna.** Siguiente candidata: T-003 (aprobar el PRD), porque todo lo demás depende del nuevo alcance. El usuario debe confirmarla antes de marcarla como bloqueante.

## 📋 Backlog (tasks futuras)

> Resumen de `docs/checklist.md`, que es la fuente de verdad. **El checklist todavía refleja el modelo anterior**: T-040 lo replanifica. T-040 y T-041 son nuevas y aún no están en el checklist.

| Prio | ID    | Task | Asignado a | Depende de |
|------|-------|------|------------|------------|
| P0 | T-003 | Revisar y aprobar el PRD (borrador en Claude Docs) | usuario | — |
| P0 | T-041 | Revisar el stack de T-006 para el nuevo modelo: ¿API Hono y app nativa en el MVP o solo Next.js + Supabase? | Claude Code + usuario | T-003 |
| P0 | T-040 | Replanificar `docs/checklist.md` y las etapas según el PRD; cerrar o reescribir las tasks de pagos, envíos y saldos | Claude Code + aprobación | T-003 |
| P0 | T-008 | Modelo de dominio, ahora sin pedidos pagados ni envíos: tiendas, prendas y sus estados, ventas marcadas, drops, alquiler, consignación (base: `arquitectura-v1`) | Claude Code + usuario | T-041 |
| P0 | T-002 | Convenciones de `CLAUDE.md` (idioma, ramas, commits) | usuario + Claude Code | — |
| P1 | T-004 | Actualizar `README.md` (todavía menciona `src/`). `CLAUDE.md` ya está versionado | Claude Code | T-002 |
| P1 | T-010 | Feedback del prototipo; antes hay que adaptarlo al nuevo flujo | usuario | T-040 |
| P1 | T-012 | Instalar herramientas locales (Node, pnpm, Docker, Supabase CLI) | usuario | T-041 |
| P1 | T-013 | Nombre y marca del producto | usuario | — |

**Resto del checklist (modelo anterior, a replanificar en T-040):** P2 fase 1 (T-014 a T-021) · P3 fase 2 (T-022 a T-028) · P4 negocio y legal (T-029 a T-035) · P5 (T-036 a T-039, T-007, T-009). Las tasks de proveedores de pago y envío, comisiones, IVA sobre comisiones y reembolsos (T-017, T-029 a T-033, T-036) dejan de aplicar al MVP.

## ⚙️ Decisiones pendientes y valores configurables

> Ningún valor es definitivo. "Propuesta" = sugerencia del agente sin validar; debe confirmarla el usuario o un asesor.

| Clave | Valor PY | Estado |
|-------|----------|--------|
| `locale` / `currency` | `es-PY` / `PYG` (₲, enteros, sin decimales) | Decidido |
| `timezone` | `America/Asuncion` (cortes de día de liquidaciones y drops) | Propuesta |
| `contact.channel` | WhatsApp (`wa.me`) con mensaje armado: tienda, #prenda, título, precio, link | Decidido (PRD) |
| `payments` / `shipping` | Fuera de la plataforma: los acuerdan compradora y tienda por WhatsApp | Decidido (PRD) |
| `plans.pro.price` | Por definir (mensual) | Pendiente |
| `plans.features` | Qué incluye Free y qué Pro (propuesta: Pro = consignación, drops, estadísticas, personalización avanzada, equipo) | Pendiente |
| `featured.price` / `featured.duration` | Por definir ("Feria recomendada del finde") | Pendiente |
| `consignment.default_pct` | 50 % para la proveedora, editable por tienda y por proveedora | Propuesta |
| `rental.laundry_days` | Por definir (días bloqueados entre alquileres) | Pendiente |
| `listings.max_photos` | Por definir | Pendiente |
| `store.slug.reserved` | `admin`, `api`, `login`, `explorar`, `buscar`, `drops`, `ayuda`… | Propuesta (`arquitectura-v1`) |

**Ya no aplican (modelo anterior):** `payments.provider`, `shipping.provider/options/payer`, `fees.seller_commission_pct`, `fees.buyer_protection_fee`, `refunds.window_days`, `protection.claim_window_days`, `payouts.*`, `offers.expiry_hours`.

**Otras decisiones abiertas:** nombre y marca (T-013), términos de uso que aclaren que la transacción es entre compradora y tienda, y datos personales en PY (T-034).

**Regla fija:** la app no cobra, no retiene dinero y no gestiona envíos. Si en el futuro se agrega pago con tarjeta, será una decisión nueva y explícita.

## 🧭 Decisiones clave

- 2026-11-10 — La memoria entre sesiones vive en `CONTEXT.md` y los procedimientos en `SKILLS.md`.
- 2026-11-10 — Dirección visual original, en tema oscuro, sin usar la marca, los textos ni los recursos de Depop.
- 2026-11-10 — **Stack aprobado (T-006):** monorepo TypeScript con Expo, Next.js, API Hono y Supabase. **En revisión desde el 2026-11-11 (T-041)** por el cambio de modelo.
- 2026-11-10 — Textos en español de Paraguay con voseo ("Buscá", "para vos").
- 2026-11-10 — Desarrollo 100 % local (costo USD 0). El hosting se revisa antes del lanzamiento.
- 2026-11-11 — Las reglas para agentes viven solo en `CLAUDE.md` (sin `AGENTS.md`): el equipo usa solo Claude Code.
- 2026-11-11 — **Cambio de modelo:** la app conecta compradoras con tiendas; contacto, pago y envío por WhatsApp, fuera de la plataforma. Sin bolsa, checkout, envíos ni saldos en el MVP.
- 2026-11-11 — Tiendas basadas en el funcionamiento de las tiendas de Depop: link propio, banner, bio, grilla con VENDIDO visible, seguidoras, drops.
- 2026-11-11 — Ingresos por suscripción de tiendas (Pro) y destacadas, no por comisión.

## ❓ Preguntas abiertas

- ¿El MVP es solo web móvil o incluye la app iOS desde el inicio? (T-041)
- ¿Se mantiene la API propia (Hono) o se simplifica a Next.js + Supabase? (T-041)
- ¿Alquiler y consignación entran en el MVP o pasan a la fase siguiente?
- ¿Precio del plan Pro y de las destacadas?
- ¿Habrá pago con tarjeta dentro de la app más adelante?
- ¿Nombre y marca del producto? (T-013)
- ¿Documentación en español, en inglés o mixta? (T-002)

## 🕘 Historial de sesiones (últimas 5)

### 2026-11-11 — Claude Code
- Creó y versionó `CLAUDE.md` con las reglas de trabajo y la estructura `apps/` + `packages/` (commit `b2b1c8e`, PR #2 mergeado). T-004 avanza: falta `README.md`.
- Publicó el diagrama "Flujo del MVP de Gamma" (artifact) con el modelo anterior; quedó desactualizado.
- El usuario redefinió el producto como plataforma que conecta tiendas y compradoras vía WhatsApp. Claude escribió el PRD en Claude Docs (borrador de T-003).
- `docs/arquitectura-v1.md` y la migración `supabase/migrations/20261110000000_init.sql` (otra sesión, alineadas con el nuevo modelo) **no están en el repo**; se suman tras T-041.

### 2026-11-10 — Claude Code
- Creó `SKILLS.md`, `CONTEXT.md`, la skill `/innit-repo` y `docs/master-prompt.md`. Completó T-001 y T-005.
- Completó T-006 (stack de `docs/arquitectura.md`) y creó la skill `/what-now` con dashboard y kanban.
- Creó `docs/prototipo/index.html` (prototipo navegable con compra simulada).
- **Commits:** `9b54f30`, `1a29069`, `cea9204`, `e677adf`, `1867345`, `f66a86f`.

## 🗂️ Resumen histórico (sesiones anteriores, 1 línea c/u)

- _Vacío._

---

<details>
<summary>Plantilla vacía (para reiniciar este archivo)</summary>

```markdown
# CONTEXT.md — Memoria compartida de <proyecto>
**Última actualización:** <fecha> — <agente>
## 🎯 Objetivo general
## 📍 Estado actual
## 🗺️ Etapas del producto
## 🔒 Task bloqueante
- **ID / Título / Estado / Asignado a / Criterio de cierre / Siguiente paso concreto / Bloqueos**
## 📋 Backlog (tasks futuras)
| ID | Task | Prioridad | Asignado a | Notas |
## ⚙️ Decisiones pendientes y valores configurables
## 🧭 Decisiones clave
## ❓ Preguntas abiertas
## 🕘 Historial de sesiones (últimas 5)
## 🗂️ Resumen histórico
```
</details>

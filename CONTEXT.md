# CONTEXT.md — Memoria compartida de Project Gamma

> Resumen vivo del proyecto para agentes de IA. Lo lee `/innit-repo` al inicio de cada sesión y se actualiza al cierre (ver `SKILLS.md`).
> **Límite: ≤ 200 líneas.** Escribe en bullets cortos, sin código ni logs: solo referencias a rutas, commits o PRs.

**Última actualización:** 2026-11-10 — Claude Code

---

## 🎯 Objetivo general

- Marketplace social de moda de segunda mano para Paraguay (es-PY, PYG ₲), inspirado en los patrones funcionales de Depop pero con marca, diseño y textos propios.
- MVP: comprar y vender desde la misma cuenta. Plataformas: iOS + web adaptable primero, Android después.
- Spec completa: `docs/master-prompt.md`.

## 📍 Estado actual

- **Fase:** 0, definición (todavía no hay código).
- **Rama de trabajo:** `claude/elegant-euler-m5r0y9`
- **Resumen:** El scaffold base existe (`docs/` y `src/` vacíos). Hay un sistema de memoria entre sesiones (`SKILLS.md`, `CONTEXT.md`, `/innit-repo`) y la spec del producto en `docs/master-prompt.md`.

## 🗺️ Etapas del producto

| Fase | Alcance | Estado |
|------|---------|--------|
| 0 | Stack, arquitectura, modelo de dominio y reglas configurables por mercado | En curso: stack aprobado; falta el dominio (T-008) |
| 1 | **Flujo de punta a punta mínimo:** registro → publicar anuncio → descubrir/buscar → producto → bolsa → checkout (pago simulado) → pedido → envío (simulado) → saldo del vendedor | Pendiente |
| 2 | Resto del MVP: perfil/tienda, favoritos y guardados, preferencias de marcas y tallas, mensajes y ofertas, filtros de inbox y pedidos, reseñas, reportes, bloqueo, moderación y soporte | Pendiente |
| 3 | Integración de proveedores reales de pago y envío (tras elegirlos), y endurecimiento para producción | Pendiente |
| 4 | Android, reutilizando el backend, el dominio y los componentes | Pendiente |
| 5+ | Búsqueda visual, anuncios promocionados, outfits avanzados | Fuera del MVP |

## 🔒 Task bloqueante

> Solo una a la vez. Mientras exista, los agentes no avanzan en otras tasks (ver la "Regla de bloqueo" en `SKILLS.md`).

- **Ninguna.** Siguiente candidata: T-008 (modelo de dominio y estados). El usuario debe confirmarla antes de marcarla como bloqueante.

## 📋 Backlog (tasks futuras)

> Resumen de `docs/checklist.md`, que es la fuente de verdad y está ordenado por prioridad. Aquí van solo P0 y P1; el resto aparece como conteo.

| Prio | ID    | Task | Asignado a | Depende de |
|------|-------|------|------------|------------|
| P0 | T-010 | Feedback del prototipo `docs/prototipo/index.html` | usuario | — |
| P0 | T-008 | Modelo de dominio y estados de pedido, pago y envío (`docs/dominio.md`) | Claude Code + usuario | — |
| P0 | T-002 | Convenciones de `CLAUDE.md` (idioma, ramas, commits) | usuario + Claude Code | — |
| P1 | T-004 | Versionar `CLAUDE.md` y actualizar la estructura en `CLAUDE.md` y `README.md` | Claude Code | T-002 |
| P1 | T-012 | Instalar herramientas locales (Node, pnpm, Docker, Supabase CLI) | usuario | — |
| P1 | T-013 | Nombre y marca del producto | usuario | T-010 |
| P1 | T-003 | PRD inicial | Claude Code | T-010 |

**Resto del checklist:** P2, fase 1 (T-014 a T-021, 8 tasks) · P3, fase 2 (T-022 a T-028, 7) · P4, negocio y legal (T-029 a T-035, 7) · P5, más adelante (6).

## ⚙️ Decisiones pendientes y valores configurables por mercado

> Ningún valor es definitivo. "Propuesta" = sugerencia del agente sin validar; debe confirmarla el usuario o un asesor.
> Todo se guarda como configuración por mercado (`market = PY`), nunca fijo en el código.

| Clave | Valor PY | Estado |
|-------|----------|--------|
| `locale` / `currency` | `es-PY` / `PYG` (₲, sin decimales) | Decidido (master prompt) |
| `payments.provider` | Adaptador simulado `MockPayments` | Pendiente: elegir proveedor real |
| `shipping.provider` | Adaptador simulado `MockShipping` | Pendiente: elegir proveedor o courier |
| `shipping.options` | Envío a domicilio, punto de retiro, entrega en mano | Propuesta |
| `shipping.payer` | Comprador | Propuesta |
| `fees.seller_commission_pct` | Por definir | Pendiente |
| `fees.buyer_protection_fee` | Por definir (% + monto fijo en ₲) | Pendiente |
| `taxes.vat_pct` | 10 % (IVA general de PY) | Propuesta: validar con contador si aplica a comisiones o ventas |
| `refunds.window_days` | Por definir | Pendiente |
| `protection.claim_window_days` | Por definir (desde la entrega) | Pendiente |
| `payouts.hold_days` | Por definir (días tras la entrega antes de liberar saldo) | Pendiente |
| `payouts.method` | Transferencia bancaria | Propuesta |
| `listings.min_price` / `max_photos` | Por definir | Pendiente |
| `offers.expiry_hours` | Por definir | Pendiente |

**Otras decisiones abiertas:** nombre y marca (T-013) y requisitos legales y de datos personales en PY (T-034). Ya resueltas por el stack (T-006): la autenticación y el almacenamiento de imágenes van con Supabase.

**Regla fija:** nunca marcar un pedido como pagado sin una confirmación válida del proveedor. El adaptador simulado debe verse como "MODO PRUEBA" en la UI.

## 🧭 Decisiones clave

- 2026-11-10 — La memoria entre sesiones vive en `CONTEXT.md` y los procedimientos en `SKILLS.md`.
- 2026-11-10 — Dirección visual original, en tema oscuro, sin usar la marca, los textos ni los recursos de Depop.
- 2026-11-10 — Fase 1 = un flujo de punta a punta antes de ampliar las funcionalidades.
- 2026-11-10 — **Stack aprobado (T-006):** monorepo TypeScript (pnpm + Turborepo) con `apps/mobile` (Expo), `apps/web` (Next.js) y `apps/api` (Hono), `packages/*` compartidos y Supabase (Postgres). `src/` se reemplaza por `apps/` + `packages/`. Detalle en `docs/arquitectura.md`.
- 2026-11-10 — La navegación se tomó de la grabación (Inicio, Descubrir, Vender, Inbox, Perfil con Tienda/Vendidos/Compras/Me gusta y Mi cuenta). Textos en español de Paraguay con voseo ("Buscá", "para vos").
- 2026-11-10 — Desarrollo 100 % local (costo USD 0). El hosting se revisa antes del lanzamiento; estimación inicial: ~USD 55–75/mes + USD 99/año de Apple (ver `docs/arquitectura.md`, sección 9).

## ❓ Preguntas abiertas

- ¿Proveedores de pago y de envío candidatos en Paraguay? (Fase 3; no bloquea la Fase 1)
- ¿Nombre y marca del producto?
- ¿Documentación en español, en inglés o mixta? (T-002)

## 🕘 Historial de sesiones (últimas 5)

### 2026-11-10 — Claude Code
- Creó `SKILLS.md`, `CONTEXT.md` y `.claude/skills/innit-repo/SKILL.md`.
- Creó `docs/master-prompt.md` (spec del producto). Se completaron T-001 (objetivo) y T-005 (texto final del prompt).
- Definió las etapas y la tabla de valores configurables por mercado.
- Completó T-006: el usuario aprobó el stack de `docs/arquitectura.md` y la estructura `apps/` + `packages/`.
- Creó `docs/prototipo/index.html`: prototipo navegable (HTML, sin backend) con las 5 pestañas, compra simulada, venta, ofertas y preferencias. Marca "gamma", acento lima y tarifas como placeholders.
- **Commits:** `9b54f30` (skills, contexto y master prompt). La propuesta de T-006 aún no tiene commit.

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

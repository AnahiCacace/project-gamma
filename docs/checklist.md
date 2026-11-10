# Checklist de pendientes — Project Gamma

> **Fuente de verdad del backlog.** Está ordenado de **mayor a menor prioridad**: se trabaja de arriba hacia abajo.
> `CONTEXT.md` muestra solo un resumen (P0 y P1). Lo mantienen las skills `/what-now` y `/innit-repo` (ver `SKILLS.md`).
> **Formato:** `- [ ] **ID** — tarea · ⏱ estimado · responsable · depende de`
> **⏱ Estimados:** horas de trabajo efectivo (agente + tu revisión), no días de calendario. 1 día ≈ 8 h. En las tareas marcadas 📅, el tiempo es de calendario porque depende de terceros (proveedores, contador, Apple).

**Última actualización:** 2026-11-10 — Claude Code

---

## P0 — Inmediato (desbloquea todo lo demás)

- [ ] **T-010** — Dar feedback del prototipo `docs/prototipo/index.html`: dirección visual, flujos y qué cambiar · ⏱ ~30 min · usuario · —
- [ ] **T-008** — Definir el modelo de dominio y los estados de pedido, pago y envío en `docs/dominio.md` · ⏱ ~2 h · Claude Code + aprobación del usuario · T-006 ✅
- [ ] **T-002** — Completar las convenciones de `CLAUDE.md`: idioma (de hecho, español), nombres de ramas y formato de commits · ⏱ ~30 min · usuario + Claude Code · —

## P1 — Preparar la fase 1

- [ ] **T-004** — Versionar `CLAUDE.md` en el repo (hoy no está) y actualizar la estructura en `CLAUDE.md` y `README.md` · ⏱ ~30 min · Claude Code + aprobación · T-002
- [ ] **T-012** — Instalar las herramientas locales en tu computadora: Node.js LTS, pnpm, Docker Desktop, Git y Supabase CLI · ⏱ ~1 h · usuario · —
- [ ] **T-013** — Elegir el nombre y la marca del producto ("gamma" es temporal) · ⏱ ~2 h (📅 puede llevar días decidir) · usuario · T-010
- [ ] **T-003** — Escribir el PRD inicial (problema, usuarios, métricas de éxito, alcance del MVP) a partir de `docs/master-prompt.md` · ⏱ ~2 h · Claude Code · T-010

## P2 — Fase 1: flujo de punta a punta funcional

> Orden de construcción tomado de `docs/arquitectura.md`, sección 7. Cada paso se hace en commits chicos y con tu aprobación.

- [ ] **T-014** — Crear el monorepo (pnpm + Turborepo, TypeScript, lint, Vitest) y eliminar `src/` · ⏱ ~2 h · Claude Code (requiere confirmación para instalar dependencias y borrar) · T-008, T-012
- [ ] **T-015** — Levantar Supabase local con las migraciones iniciales: usuarios, anuncios, pedidos, libro de saldos y `market_rules` PY · ⏱ ~3 h · Claude Code · T-014
- [ ] **T-016** — `packages/domain`: entidades, máquina de estados de pedido y reglas de mercado PY, con tests · ⏱ ~4 h · Claude Code · T-008, T-014
- [ ] **T-017** — `packages/payments` y `packages/shipping`: interfaces más adaptadores `Mock*` con "MODO PRUEBA", con tests · ⏱ ~3 h · Claude Code · T-016
- [ ] **T-018** — `apps/api`: auth, anuncios, pedidos, checkout simulado, webhooks simulados con verificación y saldos · ⏱ ~12 h · Claude Code · T-015, T-017
- [ ] **T-019** — `apps/web` (Next.js): registro → publicar → descubrir → producto → bolsa → checkout → pedido → envío → saldo · ⏱ ~16 h · Claude Code · T-018
- [ ] **T-020** — `apps/mobile` (Expo): el mismo flujo en iOS, probado con Expo Go · ⏱ ~16 h · Claude Code + usuario (prueba en el iPhone) · T-018
- [ ] **T-021** — Test E2E (Playwright) del flujo completo de compra simulada · ⏱ ~3 h · Claude Code · T-019

## P3 — Fase 2: resto del MVP

- [ ] **T-022** — Perfil y tienda del vendedor: edición de perfil, seguidores, editar o pausar anuncios · ⏱ ~8 h · Claude Code · T-019
- [ ] **T-023** — Favoritos, guardados (colecciones) y preferencias de marcas y talles aplicadas al feed · ⏱ ~8 h · Claude Code · T-019
- [ ] **T-024** — Mensajes en tiempo real y ofertas (aceptar, rechazar, expirar) · ⏱ ~12 h · Claude Code · T-018
- [ ] **T-025** — Filtros de Inbox (Mensajes, Vendiendo, Comprando) y de pedidos (Por enviar, Enviados, Cancelados, Completados) · ⏱ ~4 h · Claude Code · T-024
- [ ] **T-026** — Reseñas al completar un pedido · ⏱ ~4 h · Claude Code · T-019
- [ ] **T-027** — Reportes, bloqueo de usuarios y panel de moderación y soporte (rol `admin` en la web) · ⏱ ~12 h · Claude Code · T-018
- [ ] **T-028** — Búsqueda con filtros completos: categoría, marca, talle, condición, color y precio · ⏱ ~6 h · Claude Code · T-019

## P4 — Decisiones de negocio y legales (en paralelo; necesarias antes del lanzamiento)

> Los valores se registran en `CONTEXT.md` → "⚙️ Decisiones pendientes y valores configurables".

- [ ] **T-029** — Evaluar y elegir el proveedor de pagos (candidatos: Bancard, Pagopar u otros): comisiones, contrato y API · ⏱ 📅 1–3 semanas · usuario · —
- [ ] **T-030** — Evaluar y elegir el proveedor o courier de envíos y sus tarifas · ⏱ 📅 1–2 semanas · usuario · —
- [ ] **T-031** — Definir la comisión al vendedor, la tarifa de protección al comprador y los días de retención del saldo · ⏱ ~1 día · usuario · —
- [ ] **T-032** — Validar el IVA con un contador: si aplica sobre la comisión o sobre la venta, y cómo se factura · ⏱ 📅 ~1 semana · usuario + contador · —
- [ ] **T-033** — Definir los plazos de reembolso y de reclamo, la política de disputas y el método de cobro del vendedor · ⏱ ~1 día · usuario · —
- [ ] **T-034** — Términos y condiciones, política de privacidad y cumplimiento de la normativa de datos personales en PY · ⏱ 📅 2–4 semanas · usuario + asesor legal · —
- [ ] **T-035** — Definir el precio mínimo, la cantidad máxima de fotos por anuncio y la expiración de ofertas · ⏱ ~1 h · usuario · —

## P5 — Más adelante (fases 3, 4 y 5+)

- [ ] **T-036** — Integrar los proveedores reales de pago y envío (fase 3) · ⏱ ~1–2 semanas · Claude Code · T-029, T-030
- [ ] **T-009** — Revisar el hosting y los costos antes del lanzamiento (estimación: ~USD 55–75/mes + USD 99/año de Apple) · ⏱ ~2 h · usuario + Claude Code · —
- [ ] **T-037** — Crear la cuenta de Apple Developer y publicar en TestFlight o la App Store · ⏱ ~2 días (📅 + 1–3 días de revisión de Apple) · usuario · T-009
- [ ] **T-038** — Android (fase 4), reutilizando el backend, el dominio y los componentes · ⏱ ~1 semana · Claude Code · T-020
- [ ] **T-039** — Búsqueda visual, anuncios promocionados y outfits avanzados (fase 5+) · ⏱ por estimar · — · —
- [ ] **T-007** — Documentar la grabación de referencia como texto (pantallas y navegación) en `docs/` · ⏱ ~1 h · Claude Code · — (baja prioridad: la navegación ya está en el prototipo y en `CONTEXT.md`)

---

## ✅ Completado

> Formato: `- [x] **ID** — tarea (fecha · ⏱ estimado → real)`. Comparar el tiempo real con el estimado sirve para calibrar los próximos estimados.

- [x] **T-001** — Definir el objetivo general (2026-11-10)
- [x] **T-005** — Completar el master prompt (2026-11-10)
- [x] **T-006** — Stack y arquitectura aprobados (2026-11-10)
- [x] Prototipo navegable del MVP en `docs/prototipo/index.html` (2026-11-10)
- [x] **T-011** — Commit y push del prototipo y del checklist (2026-11-10)

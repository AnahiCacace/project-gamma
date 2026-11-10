# Checklist de pendientes — Project Gamma

> **Fuente de verdad del backlog.** Está ordenado de **mayor a menor prioridad**: se trabaja de arriba hacia abajo.
> `CONTEXT.md` muestra solo un resumen (P0 y P1, más el estado de las demás). Al cerrar cada sesión, marca aquí lo completado y sincroniza `CONTEXT.md` (ver `SKILLS.md` → "Cierre de sesión").
> **Formato:** `- [ ] **ID** — tarea · responsable · depende de`

**Última actualización:** 2026-11-10 — Claude Code

---

## P0 — Inmediato (desbloquea todo lo demás)

- [ ] **T-010** — Dar feedback del prototipo `docs/prototipo/index.html`: dirección visual, flujos y qué cambiar · usuario · —
- [ ] **T-008** — Definir el modelo de dominio y los estados de pedido, pago y envío en `docs/dominio.md` · Claude Code + aprobación del usuario · T-006 ✅
- [ ] **T-002** — Completar las convenciones de `CLAUDE.md`: idioma (de hecho, español), nombres de ramas y formato de commits · usuario + Claude Code · —

## P1 — Preparar la fase 1

- [ ] **T-004** — Versionar `CLAUDE.md` en el repo (hoy no está) y actualizar la estructura en `CLAUDE.md` y `README.md` (`apps/`, `packages/`, `docs/`, `SKILLS.md`, `CONTEXT.md`) · Claude Code + aprobación · T-002
- [ ] **T-012** — Instalar las herramientas locales en tu computadora: Node.js LTS, pnpm, Docker Desktop, Git y Supabase CLI · usuario · —
- [ ] **T-013** — Elegir el nombre y la marca del producto ("gamma" es temporal) · usuario · T-010
- [ ] **T-003** — Escribir el PRD inicial (problema, usuarios, métricas de éxito, alcance del MVP) a partir de `docs/master-prompt.md` · Claude Code · T-010

## P2 — Fase 1: flujo de punta a punta funcional

> Orden de construcción tomado de `docs/arquitectura.md`, sección 7. Cada paso se hace en commits chicos y con tu aprobación.

- [ ] **T-014** — Crear el monorepo (pnpm + Turborepo, TypeScript, lint, Vitest) y eliminar `src/` · Claude Code (requiere confirmación para instalar dependencias y borrar) · T-008, T-012
- [ ] **T-015** — Levantar Supabase local con las migraciones iniciales: usuarios, anuncios, pedidos, libro de saldos y `market_rules` PY · Claude Code · T-014
- [ ] **T-016** — `packages/domain`: entidades, máquina de estados de pedido y reglas de mercado PY, con tests · Claude Code · T-008, T-014
- [ ] **T-017** — `packages/payments` y `packages/shipping`: interfaces más adaptadores `Mock*` con "MODO PRUEBA", con tests · Claude Code · T-016
- [ ] **T-018** — `apps/api`: auth, anuncios, pedidos, checkout simulado, webhooks simulados con verificación y saldos · Claude Code · T-015, T-017
- [ ] **T-019** — `apps/web` (Next.js): registro → publicar → descubrir → producto → bolsa → checkout → pedido → envío → saldo · Claude Code · T-018
- [ ] **T-020** — `apps/mobile` (Expo): el mismo flujo en iOS, probado con Expo Go · Claude Code + usuario (prueba en el iPhone) · T-018
- [ ] **T-021** — Test E2E (Playwright) del flujo completo de compra simulada · Claude Code · T-019

## P3 — Fase 2: resto del MVP

- [ ] **T-022** — Perfil y tienda del vendedor: edición de perfil, seguidores, editar o pausar anuncios · T-019
- [ ] **T-023** — Favoritos, guardados (colecciones) y preferencias de marcas y talles aplicadas al feed · T-019
- [ ] **T-024** — Mensajes en tiempo real y ofertas (aceptar, rechazar, expirar) · T-018
- [ ] **T-025** — Filtros de Inbox (Mensajes, Vendiendo, Comprando) y de pedidos (Por enviar, Enviados, Cancelados, Completados) · T-024
- [ ] **T-026** — Reseñas al completar un pedido · T-019
- [ ] **T-027** — Reportes, bloqueo de usuarios y panel de moderación y soporte (rol `admin` en la web) · T-018
- [ ] **T-028** — Búsqueda con filtros completos: categoría, marca, talle, condición, color y precio · T-019

## P4 — Decisiones de negocio y legales (en paralelo; necesarias antes del lanzamiento)

> Los valores se registran en `CONTEXT.md` → "⚙️ Decisiones pendientes y valores configurables".

- [ ] **T-029** — Evaluar y elegir el proveedor de pagos (candidatos: Bancard, Pagopar u otros): comisiones, contrato y API · usuario
- [ ] **T-030** — Evaluar y elegir el proveedor o courier de envíos y sus tarifas · usuario
- [ ] **T-031** — Definir la comisión al vendedor, la tarifa de protección al comprador y los días de retención del saldo · usuario
- [ ] **T-032** — Validar el IVA con un contador: si aplica sobre la comisión o sobre la venta, y cómo se factura · usuario + contador
- [ ] **T-033** — Definir los plazos de reembolso y de reclamo, la política de disputas y el método de cobro del vendedor · usuario
- [ ] **T-034** — Términos y condiciones, política de privacidad y cumplimiento de la normativa de datos personales en PY · usuario + asesor legal
- [ ] **T-035** — Definir el precio mínimo, la cantidad máxima de fotos por anuncio y la expiración de ofertas · usuario

## P5 — Más adelante (fases 3, 4 y 5+)

- [ ] **T-036** — Integrar los proveedores reales de pago y envío (fase 3) · T-029, T-030
- [ ] **T-009** — Revisar el hosting y los costos antes del lanzamiento (estimación: ~USD 55–75/mes + USD 99/año de Apple) · usuario
- [ ] **T-037** — Crear la cuenta de Apple Developer y publicar en TestFlight o la App Store · usuario · T-009
- [ ] **T-038** — Android (fase 4), reutilizando el backend, el dominio y los componentes · T-020
- [ ] **T-039** — Búsqueda visual, anuncios promocionados y outfits avanzados (fase 5+) · —
- [ ] **T-007** — Documentar la grabación de referencia como texto (pantallas y navegación) en `docs/` · Claude Code · baja prioridad: la navegación ya está en el prototipo y en `CONTEXT.md`

---

## ✅ Completado

- [x] **T-001** — Definir el objetivo general (2026-11-10)
- [x] **T-005** — Completar el master prompt (2026-11-10)
- [x] **T-006** — Stack y arquitectura aprobados (2026-11-10)
- [x] Prototipo navegable del MVP en `docs/prototipo/index.html` (2026-11-10)
- [x] **T-011** — Commit y push del prototipo y del checklist (2026-11-10)

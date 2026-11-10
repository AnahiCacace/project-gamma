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
| 0 | Stack, arquitectura, modelo de dominio y reglas configurables por mercado | Pendiente |
| 1 | **Flujo de punta a punta mínimo:** registro → publicar anuncio → descubrir/buscar → producto → bolsa → checkout (pago simulado) → pedido → envío (simulado) → saldo del vendedor | Pendiente |
| 2 | Resto del MVP: perfil/tienda, favoritos y guardados, preferencias de marcas y tallas, mensajes y ofertas, filtros de inbox y pedidos, reseñas, reportes, bloqueo, moderación y soporte | Pendiente |
| 3 | Integración de proveedores reales de pago y envío (tras elegirlos), y endurecimiento para producción | Pendiente |
| 4 | Android, reutilizando el backend, el dominio y los componentes | Pendiente |
| 5+ | Búsqueda visual, anuncios promocionados, outfits avanzados | Fuera del MVP |

## 🔒 Task bloqueante

> Solo una a la vez. Mientras exista, los agentes no avanzan en otras tasks (ver la "Regla de bloqueo" en `SKILLS.md`).

- **Ninguna.** Siguiente candidata: T-006. El usuario debe confirmarla antes de marcarla como bloqueante.

## 📋 Backlog (tasks futuras)

| ID    | Task | Prioridad | Asignado a | Notas |
|-------|------|-----------|------------|-------|
| T-006 | Proponer stack y arquitectura (iOS + web, backend, adaptadores de pago y envío) y esperar aprobación | Alta | — | Fase 0. Explicar la opción recomendada y sus consecuencias |
| T-002 | Completar las convenciones de la sección 6 de `CLAUDE.md` (idioma, ramas, commits) | Alta | — | El idioma de facto es el español |
| T-008 | Definir el modelo de dominio y los estados de pedido, pago y envío | Alta | — | Fase 0. Depende de T-006 |
| T-007 | Guardar la grabación de referencia en el repo o un resumen de sus pantallas | Media | — | Hoy es solo un adjunto de la sesión |
| T-003 | Escribir el PRD inicial en `docs/` a partir de `docs/master-prompt.md` | Media | — | — |
| T-004 | Actualizar la tabla de estructura de `CLAUDE.md` (`SKILLS.md`, `CONTEXT.md`, `.claude/skills/`) | Baja | — | — |

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

**Otras decisiones abiertas:** stack (T-006), nombre y marca propios, proveedor de autenticación, almacenamiento de imágenes, requisitos legales y de datos personales en PY.

**Regla fija:** nunca marcar un pedido como pagado sin una confirmación válida del proveedor. El adaptador simulado debe verse como "MODO PRUEBA" en la UI.

## 🧭 Decisiones clave

- 2026-11-10 — La memoria entre sesiones vive en `CONTEXT.md` y los procedimientos en `SKILLS.md`.
- 2026-11-10 — Dirección visual original, en tema oscuro, sin usar la marca, los textos ni los recursos de Depop.
- 2026-11-10 — Fase 1 = un flujo de punta a punta antes de ampliar las funcionalidades.

## ❓ Preguntas abiertas

- ¿Proveedores de pago y de envío candidatos en Paraguay? (Fase 3; no bloquea la Fase 1)
- ¿Nombre y marca del producto?
- ¿Documentación en español, en inglés o mixta? (T-002)

## 🕘 Historial de sesiones (últimas 5)

### 2026-11-10 — Claude Code
- Creó `SKILLS.md`, `CONTEXT.md` y `.claude/skills/innit-repo/SKILL.md`.
- Creó `docs/master-prompt.md` (spec del producto). Se completaron T-001 (objetivo) y T-005 (texto final del prompt).
- Definió las etapas y la tabla de valores configurables por mercado.
- **Commits:** ninguno todavía (pendiente de aprobación del usuario).

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

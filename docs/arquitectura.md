# Propuesta de stack y arquitectura — T-006

> **Estado:** PROPUESTA, sin aprobar. No se adopta nada ni se escribe código hasta que el usuario la apruebe (ver sección 8).
> **Fuente de requisitos:** `docs/master-prompt.md` · **Contexto:** `CONTEXT.md`

## 1. Punto de partida

- El repositorio no tiene stack, código ni dependencias. Solo están `docs/`, `src/` (vacía), `README.md`, `CLAUDE.md`, `SKILLS.md` y `CONTEXT.md`.
- Las convenciones útiles que se conservan son las reglas de `CLAUDE.md` (confirmaciones de git, cambios pequeños), la memoria en `CONTEXT.md`, la documentación en `docs/` y el español como idioma de trabajo.
- Requisitos que condicionan la arquitectura:
  1. **iOS y web primero; Android después**, reutilizando el backend, el dominio y los componentes.
  2. **Reglas por mercado configurables**: pagos, envíos, tarifas, impuestos, reembolsos y protección.
  3. **Proveedores de pago y envío intercambiables**, con un adaptador simulado hasta elegirlos.
  4. **Nunca marcar un pedido como pagado** sin una confirmación válida del proveedor.
  5. Lo construyen principalmente **agentes de IA**, así que conviene un solo lenguaje, herramientas populares y bien documentadas, y poca infraestructura que operar.

## 2. Recomendación (resumen)

**Un monorepo en TypeScript con tres apps, que comparten el dominio, sobre Postgres gestionado:**

| Pieza | Tecnología | Por qué |
|-------|------------|---------|
| App móvil | **Expo (React Native)** | Una sola base de código para iOS ahora y Android después, casi sin trabajo extra (cumple el requisito 1). |
| Web adaptable | **Next.js** | Las páginas de producto y de tienda se renderizan en el servidor, así que Google las indexa. En un marketplace eso es adquisición gratuita. |
| API / lógica de negocio | **Node.js + Hono** (TypeScript) | Concentra las reglas críticas: pedidos, pagos, saldos y webhooks de proveedores. Las apps nunca cambian el estado de un pago por su cuenta. |
| Base de datos, auth, archivos, tiempo real | **Supabase** (Postgres gestionado) | Incluye login, almacenamiento de fotos y chat en tiempo real. Es Postgres estándar, así que se puede migrar si hace falta. |
| Paquetes compartidos | `domain`, `api-client`, `ui-tokens`, `i18n` | Las reglas, los tipos, los textos en es-PY y los colores del tema oscuro se escriben una sola vez para web y móvil. |
| Herramientas | pnpm workspaces + Turborepo, Vitest, Playwright | Builds y tests rápidos en el monorepo. |

## 3. Alternativas evaluadas

| Opción | Ventajas | Desventajas | Veredicto |
|--------|----------|-------------|-----------|
| **A. Expo + Next.js + API TS + Supabase** (recomendada) | Un lenguaje, Android casi gratis, buen SEO en la web, poco que operar | Dos frameworks de UI (RN y React web); depende en parte de Supabase | ✅ |
| B. Solo Expo, también para la web (react-native-web) | Una sola app de UI | SEO débil en la web; la experiencia web se siente "app empaquetada" | Buena si el SEO no importa |
| C. Swift nativo para iOS + web aparte | La mejor experiencia en iOS | Dos o tres bases de código; Android se haría desde cero; más lento con un equipo chico | ❌ para el MVP |
| D. Flutter | Una base de código para todo | Otro lenguaje (Dart) para el backend y la web; la web de Flutter es floja para SEO | ❌ |
| E. Firebase en vez de Supabase | Muy rápido para prototipar | Base de datos NoSQL: incómoda para pedidos, saldos y reportes contables | ❌ |
| F. Backend propio sin Supabase (Postgres + auth propios) | Control total, sin proveedor | Más trabajo y más superficie de seguridad desde el día 1 | Migración posible más adelante |

## 4. Arquitectura propuesta

```
apps/
  mobile/     Expo (iOS ahora, Android en la fase 4)
  web/        Next.js (web adaptable + panel de moderación y soporte)
  api/        Hono: pedidos, pagos, envíos, saldos, webhooks
packages/
  domain/     Entidades, máquina de estados de pedido, reglas de mercado (sin dependencias de UI ni BD)
  payments/   Interfaz PaymentProvider + MockPaymentProvider
  shipping/   Interfaz ShippingProvider + MockShippingProvider
  api-client/ Cliente tipado que usan mobile y web
  ui-tokens/  Colores, tipografía y espaciado del tema oscuro propio
  i18n/       Textos es-PY y formato de ₲
supabase/     Migraciones SQL, políticas de seguridad (RLS), seeds
```

> **Cambio de convención:** se reemplaza `src/` por `apps/` + `packages/`, que es el estándar en monorepos. Si se aprueba, hay que actualizar `README.md` y la tabla de `CLAUDE.md` (T-004). Alternativa: anidar todo dentro de `src/`.

**Flujo de un pago (requisito 4):**

1. La app pide al API `crear pedido`. El pedido queda `pendiente_pago`.
2. El API llama a `PaymentProvider.createPayment()`, que devuelve un link o formulario del proveedor (o del simulador).
3. El proveedor avisa al API por **webhook**. El API **verifica la firma** y consulta el estado al proveedor.
4. Solo entonces el pedido pasa a `pagado` y se registra el movimiento en el libro de saldos.
5. Las apps solo **muestran** el estado: nunca lo cambian.

**Interfaces de proveedor** (borrador):
- `PaymentProvider`: `createPayment`, `verifyWebhook`, `getPaymentStatus`, `refund`, `createPayout`.
- `ShippingProvider`: `quote`, `createShipment`, `getTracking`, `cancelShipment`.
- Los adaptadores `Mock*` se activan por configuración (`payments.provider = mock`). La UI muestra la franja **"MODO PRUEBA — ningún pago es real"** mientras estén activos.

## 5. Decisiones transversales

- **Dinero:** guaraníes como **enteros** (₲ no tiene decimales); nunca números con decimales.
- **Saldos de vendedor:** un **libro contable de doble entrada**, donde el saldo es la suma de los movimientos. Así hay trazabilidad para reembolsos, comisiones y auditoría.
- **Estados de pedido** (borrador, se detallan en T-008): `pendiente_pago → pagado → preparando → enviado → entregado → completado`, con salidas a `cancelado`, `en_disputa` y `reembolsado`.
- **Reglas por mercado:** una tabla `market_rules` versionada (`market = PY`) con las claves de la sección "⚙️" de `CONTEXT.md`. Cada pedido guarda la versión de reglas que aplicó, para que un cambio de comisión no altere pedidos viejos.
- **Búsqueda:** búsqueda de texto completo de Postgres + filtros en el MVP. Un motor dedicado (Meilisearch o Typesense) solo si hace falta. La búsqueda visual queda para la fase 5+.
- **Chat y ofertas:** tablas en Postgres + Supabase Realtime.
- **Fotos:** Supabase Storage, con redimensionado al subir.
- **Moderación y soporte:** reportes, bloqueos y un panel con rol `admin` dentro de la web.
- **Calidad:** tests del dominio y de la máquina de estados desde la fase 1, y un test E2E (Playwright) del flujo completo de compra simulada.

## 6. Consecuencias y costos

- **Cuentas necesarias:** Apple Developer (≈ USD 99/año, obligatoria para publicar en iOS), Supabase, hosting de la web y del API (p. ej. Vercel o Fly.io) y Expo EAS para los builds. Los niveles gratuitos alcanzan para el desarrollo; los costos llegan al publicar.
- **Dependencia de proveedor:** moderada. Supabase es Postgres estándar, y la lógica crítica vive en `apps/api` y `packages/domain`, no en Supabase.
- **Dos UIs (móvil y web):** se comparten el dominio, los textos, los tokens y el cliente del API, pero los componentes visuales se escriben dos veces. Es el costo de tener buen SEO en la web.
- **Pagos reales:** requieren elegir un proveedor local (candidatos a evaluar: Bancard, Pagopar u otros), contrato comercial y validación legal y contable. No bloquea las fases 1 y 2, que usan el simulador.

## 7. Plan de la fase 1 (si se aprueba)

1. Crear el monorepo, el lint, los tests y Supabase local.
2. Implementar `packages/domain`: entidades, máquina de estados de pedido y reglas de mercado PY.
3. Implementar los adaptadores `MockPaymentProvider` y `MockShippingProvider`, con tests.
4. Construir el API: auth, anuncios, pedidos, checkout simulado, webhooks simulados y saldos.
5. Construir el flujo de punta a punta en la web y en iOS: registro → publicar → descubrir → producto → bolsa → checkout → pedido → envío → saldo.
6. Escribir el test E2E del flujo completo.

Cada paso se hace en commits chicos, con tu aprobación según `CLAUDE.md`.

## 8. Lo que necesito que decidas

1. **¿Apruebas la opción A** (Expo + Next.js + API en TypeScript + Supabase)? ¿O prefieres B (solo Expo, más simple pero con menos SEO)?
2. **¿Reemplazamos `src/` por `apps/` + `packages/`?**
3. **Hosting:** ¿tienes preferencia o restricciones de presupuesto? Si no, propongo Vercel (web) + Fly.io (API) + Supabase.
4. **¿Ya tienes cuenta de Apple Developer?** No hace falta hasta publicar o probar en un iPhone real; el simulador alcanza para empezar.

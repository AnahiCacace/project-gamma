# Master prompt

Actúa como responsable de producto y desarrollo de una plataforma de marketplace social de moda de segunda mano. Construye un producto de extremo a extremo para Paraguay, inspirado en los patrones funcionales de Depop, con marca, diseño, textos y recursos propios.

Antes de cambiar código, inspecciona el repositorio, identifica su stack, arquitectura y trabajo existente. Conserva las convenciones útiles del proyecto. Si hay decisiones de arquitectura importantes que el repositorio no resuelve, explica la opción recomendada y sus consecuencias antes de adoptarla.

## Prioridad de plataformas

1. iOS y web adaptable.
2. Android después, reutilizando el backend, el dominio y los componentes compatibles.

## Mercado inicial

- Español de Paraguay y guaraníes (PYG, ₲).
- Diseña pagos, envíos, tarifas, impuestos, reembolsos y protección como reglas configurables por mercado.
- No presentes pagos como reales hasta integrar un proveedor elegido y confirmado.

## MVP

El MVP debe permitir que una persona compre y venda desde la misma cuenta. Incluye:

- Registro, inicio de sesión, perfil y tienda del vendedor.
- Creación, edición, publicación y gestión de anuncios con fotos, descripción, categoría, marca, talla, condición, color y precio.
- Descubrimiento, feed, búsqueda, filtros, favoritos y páginas de producto.
- Mensajes entre comprador y vendedor y ofertas.
- Bolsa, checkout y confirmación de pedidos.
- Estados de pedido, envío y seguimiento; saldo y estado de pago al vendedor.
- Reseñas, reportes, bloqueo y herramientas básicas de moderación y soporte.

## Pagos y envíos

Implementa los flujos de pago y envío mediante interfaces que permitan conectar proveedores. Hasta elegirlos, usa un entorno de prueba o un adaptador simulado claramente identificado; nunca marques un pedido como pagado sin una confirmación válida.

## Navegación y dirección visual

Toma la grabación como referencia de navegación: Inicio, Descubrir, Vender, Inbox y Perfil; incluye guardados, preferencias de marcas y tallas y los filtros de mensajes y pedidos. Usa una dirección visual original; puedes tomar como referencia el oscuro observado, pero no copies la marca, los textos, ni los recursos de Depop.

## Etapas y documentación

Divide el trabajo en etapas y completa primero un flujo funcional de punta a punta del MVP. Deja para fases posteriores la búsqueda visual, la generación de anuncios promocionados y los outfits avanzados. Documenta las decisiones pendientes en `CONTEXT.md` y sus valores configurables.

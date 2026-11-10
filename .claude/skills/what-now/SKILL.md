---
name: what-now
description: Muestra qué falta hacer en Project Gamma y qué conviene hacer ahora. Lee docs/checklist.md, lo actualiza con evidencia (git y CONTEXT.md), actualiza el dashboard de seguimiento (docs/dashboard/index.html) y muestra los pendientes ordenados de mayor a menor prioridad, con el tiempo estimado de cada task, los totales hasta el MVP y la siguiente acción recomendada. Con -dash le muestra el dashboard al usuario y con -kanban, el tablero kanban de tickets. La pueden usar el usuario o cualquier agente en cualquier momento (/what-now, /what-now P2, /what-now T-018, /what-now mvp, /what-now -dash, /what-now -kanban).
---

# /what-now

Sigue **exactamente** el procedimiento de la sección `/what-now` de `SKILLS.md`, en la raíz del repositorio. Ese archivo es la fuente de verdad.

Resumen operativo (en caso de duda, manda `SKILLS.md`):

1. Lee `docs/checklist.md` y, de `CONTEXT.md`, solo la task bloqueante y el historial. Ejecuta `git status -sb` y `git log --oneline -15`.
2. Marca como completado solo lo que tenga evidencia. Lo dudoso se pregunta.
3. Actualiza `docs/checklist.md`: completados, tasks nuevas, estimados y fecha. No cambies prioridades.
4. Ejecuta `node scripts/what-now.mjs <mismo argumento>`. El script calcula los estados (en texto, sin íconos ni emojis: `En curso`, `Esperando T-xxx`, `Usuario`, `Sin definir`, `Lista`) y los tiempos, **actualiza el dashboard** (`docs/dashboard/`) e imprime el reporte.
5. Muestra el reporte del script y agrega los cambios hechos al checklist y lo que hay que confirmar.
   - Con `-dash`: además, **muestra el dashboard al usuario** (envía `docs/dashboard/index.html` para verlo renderizado, o indica cómo abrirlo) junto con el resumen breve.
   - Con `-kanban`: muestra las columnas del tablero que imprime el script y, si se puede, el dashboard en la sección `#kanban`. El kanban es de solo lectura: los tickets se mueven cambiando el checklist o `CONTEXT.md`, nunca editando el HTML.
6. Respeta la regla de bloqueo, no te asignes tasks y nunca hagas commit ni push sin aprobación (`CLAUDE.md`).

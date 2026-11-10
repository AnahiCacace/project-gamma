---
name: innit-repo
description: Inicializa una sesión de trabajo en Project Gamma. Lee CONTEXT.md, verifica con git (solo lectura) que esté al día, reporta el objetivo, el estado del repo, la task bloqueante y las próximas tasks, y no deja avanzar hasta cerrar la task pendiente. Úsala al inicio de cada sesión o cuando el usuario escriba /innit-repo.
---

# /innit-repo

Sigue **exactamente** el procedimiento de la sección `/innit-repo` de `SKILLS.md`, en la raíz del repositorio. Ese archivo es la fuente de verdad: no dupliques ni reinterpretes las reglas aquí.

Resumen operativo (en caso de duda, manda `SKILLS.md`):

1. Lee `CONTEXT.md`. No explores el resto del repo.
2. Ejecuta `git status -sb` y `git log --oneline -10`, y detecta discrepancias con `CONTEXT.md`.
3. Reporta el estado con el formato fijo de `SKILLS.md` (máx. ~25 líneas).
4. Aplica la **regla de bloqueo**: si hay una task bloqueante, no avances en otra cosa hasta cumplir su criterio de cierre. Solo el usuario puede pausarla o cancelarla.
5. Propón el siguiente paso concreto.
6. Al cerrar la sesión, actualiza `CONTEXT.md` según "Cierre de sesión" y las "Reglas de compactación". Commitear requiere confirmación según `CLAUDE.md`.

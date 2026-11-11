# CLAUDE.md — Instrucciones para Claude Code en Project Gamma

Este archivo define cómo debe trabajar Claude Code en este repositorio.
**Es editable:** modifica, agrega o elimina secciones según evolucione el proyecto.

---

## 1. Regla principal (obligatoria)

> **No ejecutes `git pull`, `git merge`, `git push` ni `git commit` sin mi confirmación previa y explícita.**

- Antes de cualquiera de estas acciones, muestra un resumen de lo que vas a hacer (archivos afectados, mensaje de commit, rama de origen/destino) y **espera mi aprobación**.
- La aprobación vale solo para esa acción puntual. No la reutilices para acciones posteriores.
- Aplica también a variantes y equivalentes: `git rebase`, `git reset`, `git cherry-pick`, `git fetch` seguido de merge, `git stash pop` con conflictos, force-push, crear/cerrar/mergear pull requests, y cualquier comando que modifique el historial o el repositorio remoto.
- Si no estás seguro de si una acción requiere confirmación, **pregunta**.

## 2. Qué puedes hacer sin pedir confirmación

- Leer archivos y explorar el repositorio.
- Comandos git de solo lectura: `git status`, `git diff`, `git log`, `git show`, `git branch`.
- Crear o editar archivos en el árbol de trabajo (los cambios quedan sin commitear hasta que yo los apruebe).
- Ejecutar tests, linters o scripts locales que no tengan efectos externos.

## 3. Acciones que siempre requieren confirmación

- Todo lo listado en la Regla principal.
- Borrar archivos o carpetas.
- Instalar o actualizar dependencias.
- Llamar a servicios externos, publicar contenido o enviar mensajes en mi nombre.
- Cambiar configuraciones del repositorio, CI/CD o permisos.

## 4. Estructura del repositorio

| Ruta              | Contenido                                                                 |
|-------------------|---------------------------------------------------------------------------|
| `CONTEXT.md`      | Memoria del proyecto: objetivo, tasks, decisiones y estado                 |
| `SKILLS.md`       | Documentación de las skills del proyecto                                  |
| `.claude/skills/` | Skills de Claude Code (`/innit-repo`, `/what-now`)                        |
| `docs/`           | Especificaciones, arquitectura, checklist, dashboard y prototipo          |
| `scripts/`        | Scripts locales (ej. `what-now.mjs`)                                       |
| `apps/`           | Apps del monorepo: `mobile` (Expo), `web` (Next.js), `api` (Hono)          |
| `packages/`       | Código compartido: `domain`, `payments`, `shipping`, `api-client`, `ui-tokens`, `i18n` |
| `supabase/`       | Migraciones SQL, políticas RLS y seeds                                    |

- `apps/`, `packages/` y `supabase/` son la estructura aprobada en T-006 (`docs/arquitectura.md`) y todavía no existen.
- `src/` (vacía) se reemplaza por `apps/` + `packages/`. No pongas código nuevo en `src/`.

_Actualizar esta tabla a medida que crezca el proyecto._

## 5. Forma de trabajo

- Antes de tareas grandes, propone un plan breve y espera mi visto bueno.
- Mantén los cambios pequeños y enfocados en lo que se pidió.
- Al terminar, resume qué cambiaste, qué quedó pendiente y cualquier riesgo.
- Si algo falla (tests, comandos), repórtalo tal cual; no lo ocultes ni inventes resultados.

## 6. Convenciones

- **Idioma:** documentación en español o inglés (_definir_).
- **Ramas:** _definir_ (ej. `feature/<nombre>`, `fix/<nombre>`).
- **Mensajes de commit:** _definir_ (ej. imperativo, en presente: "Agrega PRD inicial").
- **Estilo de código:** _definir cuando se elija el stack_.

## 7. Notas adicionales

_Agrega aquí cualquier otra instrucción para Claude Code._

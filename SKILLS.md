# SKILLS.md — Catálogo de skills de Project Gamma

Este archivo reúne las **skills** (procedimientos reutilizables) que siguen los agentes de IA (Claude Code, Codex, Cursor, etc.) en este repositorio.

- **Fuente de verdad:** la definición completa de cada skill vive aquí. Cualquier agente, de cualquier herramienta, puede leerla y seguirla.
- **Atajo en Claude Code:** cada skill tiene además un archivo en `.claude/skills/<nombre>/SKILL.md` para invocarla con `/<nombre>`. Ese archivo solo apunta a esta definición, así que **si cambias una skill, cámbiala aquí**.
- **Otras herramientas:** si tu agente no reconoce `/<nombre>`, pídele: _"Ejecuta la skill `/<nombre>` definida en SKILLS.md"_.

## Índice

| Skill          | Para qué sirve                                                                 | Cuándo usarla                         |
|----------------|--------------------------------------------------------------------------------|---------------------------------------|
| `/innit-repo`  | Cargar el contexto del repo desde `CONTEXT.md`, reportar el estado y aplicar el bloqueo por task pendiente | Al inicio de cada sesión              |

_Agrega una fila por cada skill nueva y su sección abajo, usando la plantilla del final._

---

## `/innit-repo` — Inicializar sesión con el contexto del repo

### Objetivo

Que cualquier agente entienda **en pocos segundos y con pocos tokens**:

1. cuál es el **objetivo general** del proyecto,
2. qué se hizo en **sesiones anteriores**,
3. qué hay que hacer **ahora**, y
4. si quedó una **task pendiente que bloquea** el resto del trabajo.

Todo esto sale de `CONTEXT.md`, un resumen compacto que reemplaza a releer el repositorio o el historial completo. Así la ventana de contexto se reserva para el trabajo real.

### Entradas

- `CONTEXT.md` (obligatoria). Si no existe, ver el paso 1.
- `CLAUDE.md`, solo si el agente aún no lo tiene cargado.
- Salidas de **solo lectura** de git: `git status -sb` y `git log --oneline -10`.

> No explores el resto del repositorio durante esta skill. Lee otros archivos solo si `CONTEXT.md` los referencia explícitamente **y** son necesarios para la task bloqueante.

### Procedimiento

**Paso 1. Cargar el contexto**
- Lee `CONTEXT.md` completo.
- Si no existe, créalo copiando la plantilla de `CONTEXT.md` (sección "Plantilla vacía" al final de ese archivo), pregúntale al usuario por el objetivo general y detente ahí.

**Paso 2. Verificar que el contexto esté al día (detección de desfase)**
- Ejecuta `git status -sb` y `git log --oneline -10`. Son de solo lectura, así que no requieren confirmación.
- Compara con `CONTEXT.md`:
  - ¿Hay commits más recientes que la última entrada del historial que no estén registrados?
  - ¿Hay cambios sin commitear que no correspondan a la task en curso?
  - ¿La rama actual coincide con la que indica la task en curso?
- Anota cada discrepancia para el reporte. **No la corrijas por tu cuenta.**

**Paso 3. Reportar al usuario** con este formato fijo y breve (máx. ~25 líneas):

```
## Estado del repo — <fecha>

🎯 Objetivo: <1 línea>
📍 Fase actual: <1 línea>
🌿 Rama / árbol de trabajo: <rama> — <limpio | N archivos modificados>

🔒 Task bloqueante: <ID — título — estado — asignado a>   (o "Ninguna")
   Criterio de cierre: <de CONTEXT.md>
   Siguiente paso concreto: <de CONTEXT.md>

📋 Próximas tasks (top 3 del backlog):
   1. <ID — título — prioridad>
   2. ...
   3. ...

🕘 Última sesión: <fecha — resumen en 1 línea>
⚠️ Discrepancias detectadas: <lista o "Ninguna">
❓ Preguntas abiertas que te afectan: <lista o "Ninguna">
```

**Paso 4. Aplicar la regla de bloqueo** (ver la sección siguiente).

**Paso 5. Proponer la acción inmediata**
- Si hay una task bloqueante, propón continuar con su "siguiente paso concreto".
- Si no la hay, propón tomar la task de mayor prioridad del backlog y **pide confirmación** antes de marcarla como bloqueante (`🔒 En curso`).

### Regla de bloqueo (obligatoria)

Si `CONTEXT.md` tiene una task en la sección **"🔒 Task bloqueante"**:

1. **El agente no puede avanzar en ninguna otra task** del backlog ni en trabajo nuevo hasta cumplir el **criterio de cierre** de esa task.
2. Si el usuario pide otra cosa, el agente le recuerda la task bloqueante y le ofrece tres opciones:
   - **a) Terminarla primero** (opción por defecto).
   - **b) Pausarla explícitamente.** La task vuelve al backlog con el motivo y la fecha anotados, y la nueva task pasa a ser la bloqueante.
   - **c) Cancelarla.** Se mueve al historial como "Cancelada", con el motivo.
3. Solo el **usuario** puede elegir b) o c). Un agente nunca desbloquea por su cuenta.
4. **Excepciones permitidas** mientras hay bloqueo: tareas de solo lectura (responder preguntas, explicar código) y correcciones necesarias para cumplir la task bloqueante.
5. Solo puede haber **una** task bloqueante a la vez. Eso evita dispersión entre sesiones y entre agentes.

### Trabajo con varios agentes

- Cada task tiene un campo **"Asignado a"** (p. ej. `Claude Code`, `Codex`, `humano`).
- Un agente **no toma** una task asignada a otro agente salvo que el usuario lo indique.
- Si dos agentes corren `/innit-repo` en paralelo, ambos reportan la misma task bloqueante, y solo trabaja en ella el agente asignado. El resto puede hacer tareas de solo lectura o preparar subtareas, siempre que el usuario lo autorice.

### Cierre de sesión (obligatorio para que la skill funcione)

`/innit-repo` solo sirve si `CONTEXT.md` se mantiene al día. **Antes de terminar cualquier sesión** donde hubo trabajo, el agente actualiza `CONTEXT.md`:

1. Agrega una entrada al **historial** con fecha, agente, qué se hizo (máx. 3 bullets), commits relevantes y archivos clave.
2. Actualiza la **task bloqueante**: su estado, el siguiente paso concreto y los bloqueos. Si se cumplió el criterio de cierre, la mueve al historial como "Completada" y deja la sección en "Ninguna".
3. Marca lo completado en **`docs/checklist.md`**, agrega allí las tasks nuevas en su nivel de prioridad (P0–P5) y sincroniza el resumen del backlog de `CONTEXT.md` (solo P0 y P1).
4. Registra las **decisiones** importantes (qué se decidió y por qué, en 1 línea).
5. Aplica las **reglas de compactación** (abajo).
6. Muestra el diff de `CONTEXT.md` al usuario. Commitear el cambio requiere confirmación, según `CLAUDE.md`.

El usuario también puede pedirlo en cualquier momento: _"actualiza CONTEXT.md"_.

### Reglas de compactación (para proteger la ventana de contexto)

- `CONTEXT.md` debe quedar en **≤ 200 líneas**.
- El **historial detallado** guarda solo las **5 sesiones más recientes**. Las anteriores se resumen en 1 línea cada una dentro de "Resumen histórico", y si esa sección crece mucho, se agrupan por fase.
- Las tasks completadas no se quedan en el backlog: se mueven al historial.
- Nada de pegar código, logs ni transcripciones en `CONTEXT.md`. Basta con referenciar rutas, commits o PRs.
- Escribe en bullets y frases cortas.

---

## Plantilla para nuevas skills

```markdown
## `/<nombre>` — <título corto>

### Objetivo
<qué problema resuelve y para quién>

### Entradas
<archivos, comandos de solo lectura o datos que necesita>

### Procedimiento
1. ...
2. ...

### Salida
<qué entrega al usuario y con qué formato>

### Reglas / restricciones
<qué NO debe hacer el agente; qué requiere confirmación según CLAUDE.md>
```

Además, crea `.claude/skills/<nombre>/SKILL.md` que apunte a esta sección (copia el de `innit-repo` como ejemplo).

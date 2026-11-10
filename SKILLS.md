# SKILLS.md — Catálogo de skills de Project Gamma

Este archivo reúne las **skills** (procedimientos reutilizables) que siguen los agentes de IA (Claude Code, Codex, Cursor, etc.) en este repositorio.

- **Fuente de verdad:** la definición completa de cada skill vive aquí. Cualquier agente, de cualquier herramienta, puede leerla y seguirla.
- **Atajo en Claude Code:** cada skill tiene además un archivo en `.claude/skills/<nombre>/SKILL.md` para invocarla con `/<nombre>`. Ese archivo solo apunta a esta definición, así que **si cambias una skill, cámbiala aquí**.
- **Otras herramientas:** si tu agente no reconoce `/<nombre>`, pídele: _"Ejecuta la skill `/<nombre>` definida en SKILLS.md"_.

## Índice

| Skill          | Para qué sirve                                                                 | Cuándo usarla                         |
|----------------|--------------------------------------------------------------------------------|---------------------------------------|
| `/innit-repo`  | Cargar el contexto del repo desde `CONTEXT.md`, reportar el estado y aplicar el bloqueo por task pendiente | Al inicio de cada sesión              |
| `/what-now`    | Actualizar `docs/checklist.md` y el dashboard, y mostrar los pendientes por prioridad, con tiempo estimado y la siguiente acción recomendada (`-dash` muestra el dashboard) | En cualquier momento, por el usuario o por un agente |

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

## `/what-now` — ¿Qué sigue?

### Objetivo

Responder en cualquier momento **"¿qué falta y qué hago ahora?"** a partir de `docs/checklist.md`:

1. obtener el estado del proyecto desde el checklist,
2. **actualizar** el checklist con lo que cambió,
3. **mostrar** los pendientes ordenados de **mayor a menor prioridad**, con el **tiempo estimado** de cada task,
4. **actualizar automáticamente el dashboard** de seguimiento (`docs/dashboard/index.html`), que guarda un registro por día para ver la evolución del proyecto.

La puede usar el usuario y también **cualquier agente, en cualquier momento y cuantas veces quiera**: antes de elegir una tarea, al terminar una o al dudar sobre qué sigue. Es segura de repetir porque nunca hace commit ni toma tareas por su cuenta.

### Argumentos (opcionales)

| Uso | Resultado |
|-----|-----------|
| `/what-now` | Checklist completo, de P0 a P5 |
| `/what-now P2` | Solo ese nivel de prioridad |
| `/what-now T-018` | Detalle de una task: descripción, dependencias, estimado y qué la bloquea |
| `/what-now mvp` | Solo lo necesario para el MVP (P0 a P3), con el tiempo total |
| `/what-now -dash` | Actualiza el dashboard y **se lo muestra al usuario** (ver "Dashboard") |
| `/what-now -kanban` | Actualiza el dashboard y muestra el **tablero kanban** de tickets: en el chat como columnas de texto y, si se puede, el dashboard abierto en `#kanban` |

Cualquier forma de `/what-now` actualiza el dashboard, incluido el kanban. `-dash` y `-kanban` además los muestran.

### Entradas

- `docs/checklist.md` (obligatoria).
- De `CONTEXT.md`, solo las secciones "Task bloqueante" e "Historial", para cruzar información. No hace falta leer el resto.
- Comandos de solo lectura: `git status -sb` y `git log --oneline -15`.

> No explores el resto del repositorio. Solo verifica la existencia de los archivos que una task nombra explícitamente (por ejemplo, si `docs/dominio.md` existe).

### Procedimiento

**Paso 1. Leer el estado**
- Lee `docs/checklist.md`. Si no existe, avísale al usuario y ofrece crearlo a partir del backlog de `CONTEXT.md`. Detente ahí.
- Lee la task bloqueante y el historial de `CONTEXT.md`.

**Paso 2. Detectar cambios (con evidencia)**

Marca una task como completada **solo si hay evidencia concreta**:
- un commit que la menciona por su ID o que claramente la cumple,
- el entregable que nombra la task existe y el usuario lo aprobó (según el historial de `CONTEXT.md`), o
- el usuario lo confirmó en la sesión.

Si hay indicios pero no evidencia, **no la marques**: muéstrala como "¿completada?" y pregúntale al usuario.

**Paso 3. Actualizar `docs/checklist.md`**
- Mueve las tasks completadas a "✅ Completado" con la fecha y, si se conoce, el tiempo real (`⏱ ~2 h → 3 h`).
- Agrega las tasks nuevas que hayan surgido en la sesión, en su nivel de prioridad, con un ID nuevo (el último ID + 1) y un estimado.
- Si una task resultó más grande de lo previsto, actualiza su estimado y dilo en el reporte.
- Actualiza la línea "Última actualización".
- **No cambies prioridades** sin que lo pida el usuario. Puedes **sugerir** un cambio en el reporte.
- Si no hubo cambios, no edites el archivo y dilo en el reporte.

**Paso 4. Ejecutar el motor: `node scripts/what-now.mjs [argumento]`**

El script lee el checklist y la task bloqueante, calcula los estados y los tiempos, **actualiza el dashboard** (`docs/dashboard/index.html` y `docs/dashboard/history.json`) e imprime el reporte en Markdown. Pásale el mismo argumento que recibió la skill (`P2`, `T-018`, `mvp` o `-dash`).

- **No calcules estados ni sumas a mano:** usa la salida del script, así el resultado es igual para cualquier agente.
- Si Node.js no está disponible, haz los cálculos a mano con las reglas de abajo y avisa que el dashboard **no** se actualizó.
- El script no modifica `docs/checklist.md`. Si en el Paso 3 cambiaste el checklist, ejecútalo **después**.

Estados (el script los aplica en este orden; se escriben **siempre con texto**, **sin íconos, emojis ni símbolos**):

| Orden | Estado (texto exacto) | Regla |
|-------|-----------------------|-------|
| 1 | `En curso` | Es la task bloqueante de `CONTEXT.md` |
| 2 | `Esperando T-xxx` | Le falta al menos una dependencia; nombra cuál (si son varias: `Esperando T-014, T-008`) |
| 3 | `Usuario` | El responsable empieza por "usuario": necesita una decisión o acción suya |
| 4 | `Sin definir` | Todavía no tiene alcance ni estimado (p. ej. tasks de fase 5+) |
| 5 | `Lista` | Ninguna de las anteriores: la puede empezar un agente |

**Paso 5. Reportar.** Muestra la salida del script, que sigue este formato, y agrega las dos últimas líneas (cambios y confirmaciones), que solo conoce el agente:

```
## ¿Qué sigue? — <fecha>

Task bloqueante: <ID — título> (o "Ninguna")
Siguiente acción recomendada: <ID — título — ⏱> — <por qué es la primera>

### P0 — Inmediato · ⏱ total <suma>
| Estado | ID | Task | ⏱ Estimado | Responsable | Depende de |
|--------|----|------|-----------|-------------|------------|
| ...    |    |      |           |             |            |

### P1 — ...   (una tabla por nivel, de P0 a P5)

### Resumen de tiempos
| Hito | Tasks pendientes | ⏱ Esfuerzo estimado |
|------|------------------|---------------------|
| MVP funcional de punta a punta (P0–P2) | n | ~X h (~Y días de trabajo) |
| MVP completo (P0–P3) | n | ~X h (~Y días) |
| Negocio y legal (P4, en paralelo) | n | 📅 rango de calendario |

Dashboard actualizado: docs/dashboard/index.html
Cambios en el checklist: <lista, o "Ninguno">
Para confirmar: <tasks "¿completada?" o sugerencias de prioridad, o "Nada">
```

### Dashboard

Archivo autocontenido, sin dependencias externas: se abre con doble clic, también sin conexión. Lo genera `scripts/what-now.mjs`. **No se edita a mano**, porque se sobrescribe en cada ejecución.

| Archivo | Contenido |
|---------|-----------|
| `docs/dashboard/index.html` | Vista de seguimiento, con tema claro y oscuro y adaptada a móvil |
| `docs/dashboard/history.json` | Un registro por día: completadas, pendientes, horas restantes y tasks esperando al usuario. Si se ejecuta varias veces el mismo día, queda el último |

**Qué muestra:**
- Indicadores: avance del checklist (%), horas para el MVP funcional (P0–P2) y para el MVP completo (P0–P3), y tasks que esperan al usuario.
- "Qué sigue": la task bloqueante, la siguiente acción recomendada y la que un agente puede avanzar en paralelo.
- Horas pendientes por prioridad (barras) y evolución de las horas pendientes por fecha (línea con detalle al pasar el cursor).
- **Kanban de tickets** (`#kanban`): una tarjeta por task, en la columna de su estado. Muestra prioridad, estimado y responsable; el ticket recomendado como siguiente va resaltado. Tiene filtros por prioridad y responsable.
- Conteo de tasks por estado.
- Tabla de pendientes con filtros por prioridad, estado, responsable y texto.
- Lista de completadas.

**Columnas del kanban** (en orden de flujo; cada ticket cae en una sola, según su estado):

| Columna | Estado de la task |
|---------|-------------------|
| Por definir | `Sin definir` |
| Esperando dependencia | `Esperando T-xxx` (la tarjeta dice cuál falta) |
| Esperando al usuario | `Usuario` |
| Lista para empezar | `Lista` |
| En curso | `En curso` (la task bloqueante) |
| Completada | Sección "Completado" del checklist (muestra las 6 más recientes y se puede expandir) |

El kanban es **de solo lectura**: refleja `docs/checklist.md`. Para mover un ticket se cambia su estado real (se completa una dependencia, se marca la task bloqueante en `CONTEXT.md` o se completa en el checklist) y se vuelve a ejecutar `/what-now`. Así el tablero nunca se desincroniza del checklist.

**Con `/what-now -kanban`:** pasos 1 a 3 como siempre; luego `node scripts/what-now.mjs -kanban`, que imprime las columnas con sus tickets y horas. Muestra esa salida y, si puedes, el dashboard renderizado (sección `#kanban`).

**Con `/what-now -dash`:**
1. Pasos 1 a 3 como siempre (detectar cambios con evidencia y actualizar el checklist).
2. Ejecuta `node scripts/what-now.mjs -dash`, que actualiza el dashboard e imprime un resumen breve.
3. **Muestra el dashboard al usuario** con la herramienta que tenga el agente: en Claude Code, envía el archivo para verlo renderizado (por ejemplo, con `SendUserFile` y `display: render`). Si no puedes mostrarlo, indica la ruta y cómo abrirlo (`open docs/dashboard/index.html` en macOS o doble clic).
4. Acompáñalo con el resumen breve del script, no con el checklist completo.

**Seguimiento en el tiempo:** la evolución depende de que `docs/dashboard/history.json` se commitee junto con el checklist. Publicarlo fuera del repo (por ejemplo, como página en claude.ai) es opcional y requiere la confirmación del usuario (`CLAUDE.md`).

### Reglas para la "siguiente acción recomendada"

1. Si hay una task bloqueante, **siempre** es esa (respeta la regla de bloqueo de `/innit-repo`).
2. Si no la hay, es la primera task `Lista` del nivel de prioridad más alto.
3. Si la de mayor prioridad está en estado `Usuario`, recomiéndala igual (el usuario es el cuello de botella) y sugiere también la primera `Lista` que pueda avanzar un agente en paralelo.

### Estimados

- Son **horas de trabajo efectivo** (agente + revisión del usuario). Se convierten a días con 1 día = 8 h.
- 📅 indica tiempo de **calendario** (terceros, trámites). Esos no se suman a las horas: se muestran como rango aparte.
- Las tasks sin estimado se muestran como "por estimar" y quedan fuera de las sumas.

### Reglas para agentes

- `/what-now` **no reemplaza** la regla de bloqueo: si hay una task `En curso`, el agente no empieza otra aunque haya tasks `Lista`.
- Un agente **no se asigna** una task por correr `/what-now`. Para tomarla, propónla y espera la confirmación del usuario.
- Antes de escribir, **vuelve a leer** `docs/checklist.md`: otro agente pudo cambiarlo. Edita solo las líneas afectadas y no reordenes el resto.
- Si cambiaste el checklist, sincroniza el resumen P0–P1 del backlog en `CONTEXT.md`.
- Regenerar el dashboard es parte normal de la skill y no requiere confirmación (es un archivo local). Commitearlo sí la requiere.
- Nunca hace commit ni push: los cambios quedan para que el usuario los apruebe (`CLAUDE.md`).

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

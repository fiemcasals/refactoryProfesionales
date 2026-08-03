---
name: po-sync
description: Sincroniza lo que el Product Owner redacta en este repo (un documento de requerimientos en lenguaje natural) con los Requerimientos de un proyecto en Scrum Master AI — lee ese documento local, decide con criterio a qué Historia de Usuario corresponde cada uno, crea los Requerimientos que falten y actualiza (nombre/descripción/tipo) los que ya existen y cambiaron. Solo lee Historias de Usuario y solo crea/edita Requerimientos — nunca tests, tiempos, ramas ni estados de ejecución, eso es territorio de developer/Project Manager. Usar cuando el usuario pide "sincronizar requerimientos", "cargar lo que escribí como Product Owner", "actualizar el backlog", o corre /po-sync explícitamente.
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(curl *)
  - Write
---

# /po-sync — Sincronizar Requerimientos redactados por el Product Owner

Lee un documento que el Product Owner mantiene en este repo, en lenguaje natural (no un
formato rígido), describiendo qué Requerimientos hacen falta o cómo cambió alguno ya
existente. Lo compara contra las Historias de Usuario y Requerimientos que ya existen en
Scrum Master AI, y sincroniza sólo los Requerimientos vía `/api/v1/*` — para que el
Product Owner no tenga que entrar a la web a cargarlos a mano.

**Alcance deliberadamente angosto**: este skill sólo toca Requerimientos (crear/editar
name, description, type). Las Historias de Usuario se leen para saber a cuál cuelga cada
Requerimiento, pero nunca se crean ni editan desde acá — si el documento describe algo
para una Historia que no existe todavía, se reporta al final, no se inventa. Tampoco se
tocan status, tiempos, asignado, dependencias, tests ni ramas — el rol Product Owner no
tiene permiso para eso (la API lo rechaza con 403 si se intenta), es territorio de
developer/Project Manager.

Argumentos: `$ARGUMENTS` — opcionalmente una ruta al documento a leer. Si no se pasa,
default a `docs/requerimientos-po.md`.

---

## 0. Identidad y credenciales

- `SCRUM_API_KEY` — variable de entorno. Si no está seteada: explicar que el Project
  Manager la genera desde "Usuarios Activos" en la app para la cuenta con rol Product
  Owner, y que hay que exportarla (`export SCRUM_API_KEY=sk_...`). Parar acá si falta.
  **Nunca** escribir esta key a ningún archivo del repo.
- `SCRUM_API_URL` — la base de la instancia (ej. `https://scrum.tudominio.com`). **No es
  secreta y no hay que preguntarla todavía**: se resuelve en el paso 1 leyendo el
  manifest del repo. Sólo si el manifest tampoco la tiene se llega a pedírsela al usuario.

Todas las llamadas llevan `-H "Authorization: Bearer $SCRUM_API_KEY"`. Si `$SCRUM_API_URL`
tiene un `/` final, quitarlo antes de concatenar rutas.

## 1. Leer o inicializar el manifest

Leer `docs/po-manifest.json` en la raíz del repo (es propio de este skill, no el mismo que
usa `/scrum-sync` para developer — ese guarda referencias a código; este guarda
referencias a secciones de este documento). Si no existe, crear:

```json
{
  "apiUrl": null,
  "projectId": null,
  "lastSyncAt": null,
  "mappings": []
}
```

- **`apiUrl`**: no es secreta — vive commiteada en el repo. Si el archivo ya la trae,
  usarla tal cual y no volver a preguntar. Si falta, antes de preguntarle nada al usuario,
  revisar si existe `docs/SCRUM_MASTER_AI.md` — el Project Manager la publica ahí ya
  resuelta (el servidor la saca sola de su propia URL pública); si está, usar ese valor.
  Sólo si ninguna de las dos fuentes la tiene, preguntarle la URL al usuario. En cualquier
  caso, guardarla en el manifest para que el resto del equipo no tenga que repetirla.
- **`projectId`**: si falta, no preguntarlo a ciegas todavía — se resuelve en el paso 1.5
  contra los proyectos que devuelve `/api/v1/me`.

Cada entrada de `mappings` es `{ requirementId, userStoryId, sourceRef }`, donde
`sourceRef` es una referencia corta a la sección del documento que originó ese
Requerimiento (ej. `docs/requerimientos-po.md#Alta de turno`) — sirve para que una
relectura futura sepa si ya se sincronizó algo y actualizarlo en vez de duplicarlo.
Recomendarle al usuario commitear este archivo (no tiene secretos, sólo IDs y la URL).

## 1.5. Confirmar identidad y rol

```bash
curl -s "$SCRUM_API_URL/api/v1/me" -H "Authorization: Bearer $SCRUM_API_KEY"
```

- `401` → la key es inválida o fue revocada. Avisar que se la pidan de nuevo al Project
  Manager, y parar.
- `200` → `{ id, username, email, role, projects: [{ id, name }, ...] }`. Esto es lo que
  determina el rol de verdad — **nunca preguntarle al usuario "qué rol sos" ni asumirlo**;
  el rol de la cuenta dueña de la key es el único que importa (y la API lo vuelve a
  validar en cada llamada de todos modos).
  - Si `role` no es `product_owner` ni `project_manager`, avisar que esta key no
    corresponde a este skill (`/scrum-sync` es para `developer`, `/qa-sync` para
    `tester`/`qa`) y sugerir el correcto en vez de seguir adelante.
  - Si el manifest no tenía `projectId`: con un solo elemento en `projects`, usar ese `id`
    directo; con varios, listarlos y preguntar cuál; vacío, avisar que el Project Manager
    todavía no agregó a este usuario a ningún proyecto, y parar. Guardar el `projectId`
    elegido en el manifest.

## 2. Traer Historias de Usuario y Requerimientos existentes

```bash
curl -s "$SCRUM_API_URL/api/v1/projects/$PROJECT_ID/user-stories" \
  -H "Authorization: Bearer $SCRUM_API_KEY"
curl -s "$SCRUM_API_URL/api/v1/projects/$PROJECT_ID/requirements" \
  -H "Authorization: Bearer $SCRUM_API_KEY"
```

- `401` → key inválida o revocada. Avisar que se la pidan de nuevo al Project Manager, y
  parar.
- `403` → key válida pero el usuario no pertenece a ese proyecto. Avisar que confirme el
  `projectId`, y parar.
- `200` en ambas → guardar en memoria. Historias de Usuario trae `{ id, code, name,
  description, acceptanceCriteria, ... }`; Requerimientos trae `{ id, code, userStoryId,
  name, description, type, status, ... }`. Son la base contra la que se razona en el
  paso siguiente.

## 3. Leer el documento del Product Owner

Leer `$ARGUMENTS` si se pasó una ruta explícita (si no existe, avisar y no asumir el
default en su lugar); si no hay argumento, leer `docs/requerimientos-po.md`. Si tampoco
existe, explicarle al usuario que tiene que escribir ahí (o donde prefiera, pasando la
ruta como argumento) qué funcionalidad quiere pedir, en el lenguaje que le resulte natural
— no hace falta ningún formato rígido tipo RF-01 — y parar.

**Esto es un trabajo de criterio, no de matching de texto.** Leé el documento como lo
haría un Project Manager familiarizado con el proyecto: para cada cosa que el Product
Owner describe,

1. **Decidí a qué Historia de Usuario pertenece**, comparando contra `name` +
   `description` + `acceptanceCriteria` de las Historias traídas en el paso 2 (nunca por
   coincidencia literal de texto). Si el documento ya agrupa el contenido bajo encabezados
   que nombran la Historia, usá eso como pista fuerte, pero confirmá con criterio que el
   contenido efectivamente corresponde. Si no hay ninguna Historia razonable a la que
   colgarlo, **no la inventes ni la crees** — dejalo afuera y reportalo al final como
   "sin Historia de Usuario clara".
2. **Decidí si ya existe un Requerimiento equivalente** (en el manifest por `sourceRef`
   de una corrida anterior, o comparando contenido contra la lista de Requerimientos del
   paso 2 aunque nunca se haya sincronizado desde acá) o si es genuinamente nuevo.
3. **Decidí el tipo** (`funcional` o `no_funcional`) por el contenido — si describe una
   restricción transversal (seguridad, performance, disponibilidad) es `no_funcional`;
   si describe una funcionalidad concreta del sistema, `funcional`.

Si tenés dudas razonables sobre a qué Historia corresponde algo, es preferible dejarlo
afuera (reportarlo en el resumen final) a inventar una relación.

## 4. Crear o actualizar cada Requerimiento

**Si ya existe** (matcheado por manifest o por contenido), actualizar sólo lo que cambió:

```bash
curl -s -X PATCH "$SCRUM_API_URL/api/v1/requirements/$REQUIREMENT_ID" \
  -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"...","description":"...","type":"funcional"}'
```

Mandar sólo los campos que realmente cambiaron respecto de lo que ya trajo el paso 2 (no
reescribir todo con lo mismo). Esta llamada rechaza con 403 cualquier intento de tocar
status/tiempos/asignado/dependencias — ese rechazo es correcto, no es un bug: no
reintentar con otros campos, simplemente no son territorio del Product Owner.

**Si es nuevo**, crearlo colgado de la Historia de Usuario resuelta en el paso 3:

```bash
curl -s -X POST "$SCRUM_API_URL/api/v1/user-stories/$USER_STORY_ID/requirements" \
  -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"...","description":"...","type":"funcional"}'
```

En ambos casos, guardar/actualizar en el manifest la entrada `{ requirementId,
userStoryId, sourceRef }` (crear si es la primera vez, actualizar `sourceRef` si ya
existía y cambió la sección del documento que lo originó).

## 5. Guardar el manifest actualizado

Reescribir `docs/po-manifest.json` con `lastSyncAt` en la fecha/hora actual (ISO) y todas
las entradas de `mappings` (viejas + nuevas).

## 6. Resumen final

Reportarle al usuario, en texto, no en JSON crudo:
- Cuántos Requerimientos se crearon, y bajo qué Historia de Usuario cada uno.
- Cuántos Requerimientos existentes se actualizaron, y qué campos cambiaron.
- Qué partes del documento quedaron "sin Historia de Usuario clara" (para que el Product
  Owner sepa qué revisar o pedirle al Project Manager que cargue esa Historia primero).

---

## Notas de implementación

- Nunca crear ni editar Historias de Usuario desde este skill — son sólo lectura acá. Si
  hace falta una nueva, es el Project Manager o el propio Product Owner quien la carga
  desde la app.
- Nunca reintentar con otro shape de body si la API devuelve 403 al tocar un campo de
  ejecución — ese rechazo es intencional (ver `EXECUTION_FIELDS` en
  `api/v1/requirements/[id]/route.ts`), no un error a esquivar.
- Todas las respuestas de error de la API vienen como `{"error": "..."}` — mostrar ese
  mensaje tal cual, no reinterpretarlo.
- `docs/po-manifest.json` es propio de este skill — no confundirlo ni fusionarlo con
  `docs/scrum-manifest.json` (ese lo usa `/scrum-sync` del lado del developer, con otro
  significado de `sourceRef`).

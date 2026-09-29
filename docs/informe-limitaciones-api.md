# Informe de limitaciones de la API de Scrum Master AI

**Proyecto donde se detectó:** Profesionales (`PROJ-1785509638361`)
**Fecha del relevamiento:** 2026-09-29
**Relevado por:** Project Manager (`USR-PM-PROF`, rol `project_manager`)
**Destinatario:** desarrollador de la API de Scrum Master AI
**Instancia:** omitida deliberadamente. La URL de la instancia no se escribe en archivos del
repositorio; sale del entorno (ver `scrumDocs/EMPEZA-ACA-SEGUN-TU-ROL.md`, paso 2).

---

## 1. Para qué sirve este documento

Seis operaciones que el rol con más permisos del proyecto no puede completar, más dos
comportamientos que devuelven datos incorrectos. Todas se reproducen con una key de
`project_manager`, que es el rol con más permisos. **Ninguna devuelve `403`**: o el endpoint
no existe (`405`), o existe pero descarta el campo en silencio (`200` sin efecto).

Ese detalle es el que más importa para el arreglo. Un `403` significa "el rol no puede"; un
`200` que no hace nada significa **"el cliente cree que guardó algo que no se guardó"**, que es
la peor de las dos fallas porque el error aparece tarde y lejos del lugar donde se produjo.

Todos los cuerpos JSON del relevamiento se enviaron desde archivo con `-d @`, no en línea, y
se verificó el JSON antes de mandarlo, para descartar que un error de citación del shell
produjera un falso positivo. En una sonda, `Set-Content` de PowerShell 5.1 agregó un BOM al
cuerpo y la API rechazó un JSON inválido; esa sonda se descartó antes de sacar conclusiones.

---

## 2. Resumen para triaje

| # | Operación | Qué pasa hoy | Qué debería pasar | Severidad |
|---|---|---|---|---|
| 1 | Editar una Entrega | `405` en los 4 métodos/ruta | `PATCH` que actualice fecha, responsable y descripción | **Alta** |
| 2 | Crear Entrega con fecha | `201` pero `due_date` queda `null` | Persistir `due_date`, `owner_id`, `description` | **Alta** |
| 3 | `approvalStatus` en Requerimiento | `200` pero el campo no cambia nunca | Escribirlo, o `400` si el valor no es válido | **Alta** |
| 4 | Campo `assignee` del listado | Siempre `"Unassigned"` | Resolver el nombre, como sí hace el `PATCH` | **Alta** |
| 5 | Código de los hijos de un operacional | Reinicia la serie: `RF-01`, `RF-02`… | Códigos únicos, o serie propia | Media |
| 6 | `PUT` de entornos | Recrea los entornos y cambia sus ids | Actualizar en sitio, conservar ids | Media |
| 7 | Mensaje de error de entornos | Dice "tiene que ser una lista" cuando sí se envió una lista | Mensaje que describa lo que pide | Baja |

---

## 3. Detalle de cada punto

### 3.1 No se puede editar una Entrega (bloqueante)

Una Entrega se crea, se lee y se borra, pero **no se modifica de ninguna forma**. Se probaron
las cuatro combinaciones de método y ruta que podrían editarla:

| Método | Ruta | Cuerpo | Resultado |
|---|---|---|---|
| `PATCH` | `/api/v1/deliveries/{id}` | `{"due_date": ...}` | `405` |
| `PUT` | `/api/v1/deliveries/{id}` | `{"name":..., "owner_id":...}` | `405` |
| `PATCH` | `/api/v1/projects/{id}/deliveries` | `{"name":..., "owner_id":...}` | `405` |
| `PUT` | `/api/v1/projects/{id}/deliveries` | `{"name":..., "owner_id":...}` | `405` |

El `405` es independiente del contenido: se mandó en la primera prueba una fecha idéntica a la
ya almacenada, de modo que aunque el endpoint existiera no habría tenido efecto observable.

**Borrar y recrear tampoco sirve.** El `POST` descarta el `owner_id`, así que la Entrega
recreada vuelve a nacer sin nada:

```
POST /api/v1/projects/PROJ-1785509638361/deliveries
{"name":"sonda","due_date":"2026-10-06T16:00:00.000Z","owner_id":"USR-PM-PROF"}
→ 201
  {"id":"DEL-...","name":"sonda","description":null,"due_date":null,"owner_id":null}
```

Se probó en `snake_case` (`due_date`, `owner_id`), en `camelCase` (`dueDate`, `ownerId`) y con
variantes en español (`fechaVencimiento`, `descripcion`). Las tres formas devuelven los tres
campos en `null`, sin error.

**Lo único que sí funciona:**

| Operación | Resultado |
|---|---|
| `GET /api/v1/projects/{id}/deliveries` | `200`, lista completa con fechas y responsables |
| `POST /api/v1/projects/{id}/deliveries` (sólo `name`) | `201`, crea la Entrega vacía |
| `DELETE /api/v1/deliveries/{id}` | `200 {"ok":true}` |

**De los cuatro campos de una Entrega, la API sólo puede escribir uno: el nombre.** Falta
fecha de vencimiento, responsable y descripción.

**Dónde se resuelve hoy:** en la aplicación web, en el **grafo del proyecto**. Una Entrega
asociada a una Historia o Requerimiento se ve en el grafo, y ahí se le cargan fecha y
responsable. Confirmado en uso. El flujo es viable pero manual y no queda registrado en la
API, así que una Entrega creada por script nace incompleta y sólo se completa a mano.

### 3.2 `approvalStatus` no se puede escribir nunca (bloqueante)

El campo está en el listado de campos que el PM puede escribir según
`scrumDocs/roles/project-manager.md`. En la práctica **el `PATCH` lo ignora siempre**:

| Valor enviado | HTTP | `approvalStatus` resultante |
|---|---|---|
| `"approved"` | `200` | `pending` |
| `"aprobado"` | `200` | `pending` |
| `"Accepted"` | `200` | `pending` |
| `"valorDeliberadamenteInvalido_xyz123"` | `200` | `pending` |

La cuarta fila es la importante: **un valor deliberadamente inválido tampoco produce `400`**.
Si el campo se validara, daría error. Que acepte el `200` y no cambie nada indica que se ignora
antes de validarlo.

**Impacto:** los 10 Requerimientos del proyecto quedaron con `approvalStatus: "pending"` y
`approvedBy` / `approvedAt` en `null`, sin ninguna vía de API para moverlos.

**Lo que no se pudo determinar:** la semántica del campo y qué rol debería escribirlo. El
documento del rol lo lista como campo del PM pero no explica qué significa, y no queda claro
si la web lo habilita para el PM o para otro rol. Cualquier aclaración sobre este campo
resuelve dos incógnitas de golpe.

### 3.3 `assignee` del listado siempre dice "Unassigned" (bloqueante por visibilidad)

`GET /api/v1/projects/{id}/requirements` devuelve `assignee: "Unassigned"` para los 10
Requerimientos, **aunque `assigneeId` sí está correcto en los 10**:

| Req | `assigneeId` (correcto) | `assignee` (devuelto) |
|---|---|---|
| RF-01 (chat, en producción) | `USR-1790598230196` (`dev`) | `"Unassigned"` |
| RF-02 … RNF-01 | `USR-1790598230196` (`dev`) | `"Unassigned"` |
| RF-06 | `USR-1790598230196` (`dev`) | `"Unassigned"` |
| 3 hijos de RO-01 | `USR-1790598230196` (`dev`) | `"Unassigned"` |

El mismo `PATCH` que asigna devuelve correctamente `assignee: "dev"`, así que la resolución del
nombre existe en el camino de escritura y falta en el de lectura.

**Impacto:** el tablero puede mostrar "Unassigned" en tarjetas que sí tienen responsable. Un
equipo que lea el tablero conclude que no hay nadie asignado.

**Comportamiento relacionado, posiblemente intencional:** después de un `PATCH` de `assignee`,
la respuesta corregía el nombre y las lecturas posteriores volvían a `"Unassigned"`. La
lectura parece leer un campo desnormalizado que no se mantiene sincronizado.

### 3.4 Los hijos de un operacional reinician la numeración de códigos (medio)

`scrumDocs/roles/project-manager.md` indica que un operacional se numera `RO-01`, `RO-02`… y que
sus hijos llevan "código de Requerimiento normal (`RF-NN`)". La implementación numera los
hijos **reiniciando la serie del proyecto**, no con una serie propia:

| Contenedor | Hijo | Código asignado | Colide con |
|---|---|---|---|
| RO-01 | entorno `dev` | `RF-01` | `REQ-1785771199977` (chat, en producción) |
| RO-01 | entorno `testing` | `RF-02` | `REQ-1785771214294` (login) |
| RO-01 | entorno `produccion` | `RF-03` | `REQ-1785771214393` (registro) |

Quedan dos tarjetas con `RF-01`, dos con `RF-02` y dos con `RF-03` en el mismo proyecto. Como
los operacionales se numeran desde `RO-01` en el proyecto, la numeración **sí** hay que
reiniciarla para los hijos; lo que falta es un espacio de nombres separado (`OP-01`, o un
prefijo) para que no choque con las RF del proyecto.

**No se puede corregir por API:** `code` no está en la lista de campos que el PM puede
escribir con `PATCH`, así que no se puede renumerar. Hay que hacerlo en la web.

### 3.5 `PUT` de entornos recrea los entornos y cambia sus ids (medio)

El `PUT` funciona, pero hay dos cosas que conviene ajustar.

**a) Recreation de ids.** Cada llamada genera ids nuevos para todos los entornos, incluso
cuando no cambia nada:

| Llamada | id devuelto |
|---|---|
| Original (antes del relevamiento) | `ENV-1790603764418-0` |
| `PUT` con el mismo contenido | `ENV-1790688861009-0` |
| `PUT` con los 3 entornos nuevos | `ENV-1790689682736-0`, `-2741-1`, `-2743-2` |
| `PUT` final (los mismos 3) | `ENV-1790689866368-0`, `-6370-1`, `-6372-2` |

Los nombres y las URLs se preservan, pero cualquier cosa que guarde el id de un entorno queda
colgando de un id que ya no existe. Debería hacer update en sitio.

**b) Mensaje de error engañoso.** El `PUT` exige un objeto que envuelve la lista:

```
{"environments":[{"nombre":"dev","baseUrl":"http://localhost:3000"}]}
```

Una lista desnuda devuelve:

```
400 {"error":"environments tiene que ser una lista"}
```

El mensaje dice "tiene que ser una lista" **cuando sí se envió una lista**. Falta el objeto
envolvente. Debería decir qué forma espera.

**Nota de documentación:** `scrumDocs/roles/project-manager.md` menciona el `PUT` de entornos
pero no documenta la forma del cuerpo. Se dedujo probando.

### 3.6 Observación menor: `GET /api/v1/user-stories/{id}` responde `405`

Al intentar leer una Historia individual por id para verificar si un `id` era una Historia, la
ruta respondió `405`. Puede ser intencional (sólo existe el listado), pero queda anotado porque
no hay forma de leer una entidad individual de esa familia, lo que obliga a traer la lista
completa para consultar una sola cosa.

---

## 4. Lo que se puede hacer hoy, sin esperar el arreglo

- **Entregas:** crearlas por API con el nombre y completar fecha y responsable a mano en el
  grafo del proyecto. Vincular el Requerimiento que cierra cada una sí se puede por API
  (`PATCH` del Requerimiento con `deliveryId`), y eso sí funciona.
- **Requerimientos:** `name`, `description`, `type`, `acceptanceCriteria`, `status`, `assignee`,
  `estimated`, `dependencies`, `deliveryId`, `start`, `end`, `observations`, `moduleId` y
  `integrantes` se escriben sin problema. Todo el alcance del proyecto se cargó por esa vía.
- **Entornos:** se pueden configurar por API con la forma envuelta, aceptando que cambien los
  ids en cada llamada.
- **Roles:** asignar, bloquear/desbloquear, crear Historias, operacionales, Módulos y
  promover ramas funciona según el documento del rol.

---

## 5. Cómo reproducir

Con una key de rol `project_manager`, apuntando a la instancia del entorno. Revertir lo que
se cree con `DELETE`.

```bash
# 3.1 — Editar una Entrega: los cuatro dan 405
for M in PATCH PUT; do
  curl -s -o /dev/null -w "$M /api/v1/deliveries/<id> -> %{http_code}\n" -X $M \
    "$SCRUM_API_URL/api/v1/deliveries/DEL-<id>" \
    -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
    -d '{"name":"x","owner_id":"USR-PM-PROF"}'
done

# 3.1 — Crear Entrega con fecha: 201 pero los campos vuelven en null
curl -s -X POST "$SCRUM_API_URL/api/v1/projects/<PROJ>/deliveries" \
  -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"sonda","due_date":"2026-10-06T16:00:00.000Z","owner_id":"USR-PM-PROF"}'

# 3.2 — approvalStatus: ni siquiera un valor inválido produce 400
curl -s -X PATCH "$SCRUM_API_URL/api/v1/requirements/<REQ>" \
  -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
  -d '{"approvalStatus":"valorInvalido_xyz123"}'
# esperado si estuviera implementado: 400 por valor inválido, o el campo actualizado

# 3.3 — assignee del listado vs assigneeId
curl -s "$SCRUM_API_URL/api/v1/projects/<PROJ>/requirements" \
  -H "Authorization: Bearer $SCRUM_API_KEY"

# 3.5 — entornos: lista desnuda vs objeto envolvente
curl -s -X PUT "$SCRUM_API_URL/api/v1/projects/<PROJ>/environments" \
  -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
  -d '[{"nombre":"dev","baseUrl":"http://localhost:3000"}]'
# 400 "environments tiene que ser una lista"  <- aunque sí se mandó una lista
```

---

## 6. Glosario de códigos de respuesta

Por si sirve al Implementar las validaciones que faltan:

| Respuesta | Significa |
|---|---|
| `400 {"error":"JSON invalido"}` | el cuerpo no es JSON; no es problema de key ni de rol |
| `400` con otro mensaje | falta o sobra un campo; el JSON ya parseó bien |
| `401` | la key es inválida o está revocada |
| `403` | el rol no puede hacer esa acción |
| `405` | el endpoint existe pero no admite ese método — **falta el endpoint** |
| `200` sin efecto | el campo se descartó en silencio — **falta la validación o el handler** |

Los dos últimos son los que aparecen en este relevamiento, y son los que másconviene
corregir: el `405` al menos es ruidoso, el `200` silencioso hace que el cliente crea que
guardó algo.

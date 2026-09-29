# Informe: la API de Scrum Master AI no permite reprogramar Entregas

**Proyecto:** Profesionales (`PROJ-1785509638361`)
**Fecha del relevamiento:** 2026-09-29
**Autor del relevamiento:** Project Manager (`USR-PM-PROF`)
**Instancia:** omitida deliberadamente — la URL de la instancia no se escribe en archivos del
repositorio, sale del entorno (ver `scrumDocs/EMPEZA-ACA-SEGUN-TU-ROL.md`, paso 2).

---

## 1. Resumen

El rol `project_manager` **no puede editar una Entrega una vez creada.** No puede cambiarle
la fecha de vencimiento, ni el responsable, ni la descripción, y tampoco crearla con esos
campos puestos. No es un permiso denegado (`403`) sino una ausencia de endpoint: la API
expone `GET`, `POST` y `DELETE` sobre Entregas, y ninguna combinación de método y ruta
permite modificarla. Se probaron `PATCH` y `PUT`, sobre la entrega individual y sobre la
colección del proyecto: las cuatro dan `405`.

Consecuencia práctica: **tres de los cuatro campos de una Entrega tienen que cargarse a mano
en la aplicación web.** Sólo el nombre se puede setear por API. Y como el `POST` descarta en
silencio los campos que no reconoce, un cliente que no lea la respuesta cree que los guardó,
y el tablero muestra una Entrega sin fecha ni responsable que en realidad nadie cargó.

---

## 2. Evidencia

Todas las llamadas se hicieron con una key de rol `project_manager`, que es el rol con más
permisos del proyecto. Los cuerpos JSON se guardaron en archivo y se enviaron con `-d @`
para descartar que un error de citación del shell produzca un falso positivo.

### 2.1 `PATCH` no existe (ni para cambiar, ni para nada)

```
PATCH /api/v1/deliveries/DEL-1785773670419
body: {"due_date": "2026-08-14T14:00:00.000Z"}   ← valor idéntico al ya almacenado
→ HTTP 405 Method Not Allowed   (cuerpo de respuesta vacío)
```

Se repitió con el cuerpo idéntico servido desde archivo, para descartar un JSON mal citado.
Mismo resultado: `405`. El valor enviado era el mismo que ya tenía la entrega, así que
aunque el endpoint existiese la operación no habría tenido efecto observable: el `405` es
independiente del contenido.

### 2.2 `POST` acepta sólo `name`

Con nombres de campo en `snake_case`, tal como los devuelve el `GET`:

```
POST /api/v1/projects/PROJ-1785509638361/deliveries
{"name":"entregable 3","description":"...","due_date":"2026-10-06T16:00:00.000Z","owner_id":"USR-PM-PROF"}
→ HTTP 201
  {"id":"DEL-1790688354352","name":"entregable 3",
   "description":null,"due_date":null,"owner_id":null, ...}
```

`name` se guardó. **`description`, `due_date` y `owner_id` volvieron `null`**: la API acepta
la petición y descarta silenciosamente los campos que no reconoce, sin error ni advertencia.

Con nombres en `camelCase` (`dueDate`, `ownerId`) y con variantes (`fechaVencimiento`,
`descripcion`), sobre una entrega de prueba: idéntico resultado, todo `null`.

### 2.3 Ninguna vía para editar una Entrega

Se probaron todas las combinaciones de método y ruta que podrían editar una Entrega. Las
seis responden `405 Method Not Allowed` con cuerpo vacío:

| Método | Ruta | Cuerpo | Resultado |
|---|---|---|---|
| `PATCH` | `/api/v1/deliveries/{id}` | `{"due_date": ...}` | 405 |
| `PUT` | `/api/v1/deliveries/{id}` | `{"name":..., "owner_id":...}` | 405 |
| `PATCH` | `/api/v1/projects/{id}/deliveries` | `{"name":..., "owner_id":...}` | 405 |
| `PUT` | `/api/v1/projects/{id}/deliveries` | `{"name":..., "owner_id":...}` | 405 |

**Borrar y recrear tampoco es salida.** El `POST` descarta el `owner_id`, así que una
Entrega recreada vuelve a nacer sin responsable, sin fecha y sin descripción:

```
POST /api/v1/projects/{id}/deliveries
{"name":"sonda","due_date":"2026-10-06T16:00:00.000Z","owner_id":"USR-PM-PROF"}
→ 201  {"id":"DEL-...","name":"sonda","description":null,"due_date":null,"owner_id":null}
```

Lo mismo se comprobó con nombres en `camelCase` (`dueDate`, `ownerId`) y con variantes
(`fechaVencimiento`, `descripcion`): idéntico resultado. El `POST` acepta la petición y
descarta en silencio lo que no reconoce, **sin devolver error**. Un cliente que no lea la
respuesta cree que guardó la fecha.

### 2.4 Lo que sí funciona

| Operación | Resultado |
|---|---|
| `GET /api/v1/projects/{id}/deliveries` | 200, lista completa con fechas y responsables |
| `POST /api/v1/projects/{id}/deliveries` (sólo `name`) | 201, crea la entrega sin fecha ni responsable |
| `DELETE /api/v1/deliveries/{id}` | 200 `{"ok":true}` |

**Los tres campos que una Entrega necesita y la API no puede cargar son: fecha de
vencimiento, responsable y descripción.**

---

## 3. Entregas afectadas

Al momento del relevamiento el proyecto tenía dos Entregas vencidas el **2026-08-14**
(46 días de atraso a la fecha de este informe), y ninguna se puede reprogramar desde la API.

| id | Nombre | Vencimiento | Responsable | Requerimiento que cierra |
|---|---|---|---|---|
| `DEL-1785773670419` | entregable 1 | 2026-08-14 14:00Z | `USR-QA-PROF` (qa-prof) | `RNF-01` (`REQ-1785771214595`) |
| `DEL-1786726577772` | entregable 2 | 2026-08-14 08:00Z | `USR-SM-PROF` (scrum-prof) | `RF-05` (`REQ-1785771214528`) |

Ambas quedan **archivadas como registro histórico**. No se borran: se conservan para trazabilidad
y como evidencia de este relevamiento. La API tampoco expone un estado "archivada" para
Entregas, de modo que permanecen visibles y vencidas en el tablero.

### Entregas creadas durante este relevamiento

| id | Nombre | Vencimiento | Responsable |
|---|---|---|---|
| `DEL-1790688354352` | entregable 3 | **sin definir** | **sin definir** |
| `DEL-1790688354506` | entregable 4 | **sin definir** | **sin definir** |

Se crearon con el nombre correcto, pero la fecha y el responsable quedaron sin definir por
la limitación documentada arriba. **Falta cargarlos a mano en la web.**

---

## 4. Lo que hay que hacer a mano

Para cada una de las dos entregas nuevas, en la aplicación web:

1. Abrir la Entrega.
2. Cargar la fecha de vencimiento.
3. Cargar el responsable.
4. Agregar la descripción (quedó `null`).

### Fechas sugeridas

Calculadas sobre la jornada declarada de lunes a miércoles, de 08:00 a 13:00 (hora de
Argentina, UTC-3), y sobre el orden de dependencias del grafo — un entregable que depende de
otro no puede vencer el mismo día.

| Entrega | Cierra | Fecha sugerida | Local | UTC |
|---|---|---|---|---|
| entregable 3 | `RF-06` — chat sobre React + Vite | martes 2026-10-06 | 13:00 | `2026-10-06T16:00:00.000Z` |
| entregable 4 | `RF-04` — coincidencia de contraseñas | miércoles 2026-10-07 | 13:00 | `2026-10-07T16:00:00.000Z` |

Las dos entregas nuevas **todavía no están vinculadas** a su Requerimiento mediante
`deliveryId`. Esa vinculación sí se puede hacer por API (`PATCH` de `RF-06` y `RF-04` con el
campo `deliveryId`), y queda pendiente de confirmación.

---

## 5. Consecuencia sobre la planificación

Cualquier plan construido a partir de fechas de Entrega leídas de la API parte de datos
incorrectos, porque las Entregas creadas por API nacen sin fecha. Para planificar hay que
tomar las fechas de la web, o mantenerlas por fuera del tablero.

Esta limitación no aplica a los Requerimientos: los campos `start` y `end` de un Requerimiento
sí se escriben por `PATCH` con key de PM, y se usaron para agendar el trabajo.

---

## 6. Cómo reproducir el relevamiento

Con una key de rol `project_manager`, apuntando a la instancia configurada en el entorno:

```bash
# 2.1 — PATCH no existe
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH "$SCRUM_API_URL/api/v1/deliveries/DEL-1785773670419" \
  -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
  -d '{"due_date":"2026-08-14T14:00:00.000Z"}'
# esperado: 405

# 2.2 — POST sólo guarda name
curl -s -X POST "$SCRUM_API_URL/api/v1/projects/PROJ-1785509638361/deliveries" \
  -H "Authorization: Bearer $SCRUM_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"sonda","due_date":"2026-10-06T16:00:00.000Z","owner_id":"USR-PM-PROF"}'
# esperado: 201 con due_date y owner_id en null
```

Revertir la sonda con `DELETE /api/v1/deliveries/{id}`.

`405` = el endpoint no admite el método. Un `403` habría significado que el rol no tiene
permiso, que es otra cosa: acá el permiso existe, la operación simplemente no está
implementada.

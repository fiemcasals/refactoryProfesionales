# Este repo está conectado a Scrum Master AI

_Generado automáticamente el 2026-08-03T14:27:27.580Z -- no editar a mano, se sobreescribe en cada publicación._

Si el usuario te pidió leer la documentación de este proyecto, o arrancó una
conversación sobre "qué sigue", "cargar requerimientos", "sincronizar tests",
"reportar avance" o similar, seguí estos pasos antes de hacer nada más.

## 1. Conseguir la API key

Preguntale al usuario **sólo** por `SCRUM_API_KEY` (si no la tenés ya como variable
de entorno) -- se la genera su Project Manager desde "Usuarios Activos" en la app.
Si no la tiene, explicáselo y pedile que la consiga antes de seguir. **Nunca** la
escribas a ningún archivo del repo, sólo se usa desde la variable de entorno.

## 2. La URL de la instancia ya la sabés -- no la preguntes

`SCRUM_API_URL` es `https://scrum.misitiowebpersonal.com.ar`. Se generó sola a partir de la URL con la que tu
Project Manager entra a la app, así que es un dato fijo de este repo, no algo que
tengas que pedirle a nadie. Usala directo en las llamadas de los pasos siguientes.
Si vas a crear/leer `docs/scrum-manifest.json` o `docs/po-manifest.json` (los usan
los skills del paso 4 para no repetir preguntas), guardala ahí en el campo `apiUrl`
si todavía no está.

## 3. Identificar el rol -- nunca preguntarlo

Con la key y la URL, llamá:

```bash
curl -s "$SCRUM_API_URL/api/v1/me" -H "Authorization: Bearer $SCRUM_API_KEY"
```

La respuesta trae `{ role, projects, ... }`. El rol de la cuenta dueña de la key es el
único dato que importa (la API lo vuelve a validar en cada llamada de todos modos) --
**no le preguntes al usuario "cuál es tu rol"**, ni le creas si te lo dice: usá el
`role` que devolvió `/api/v1/me` para elegir el skill del paso 4. `401` significa key
inválida o revocada -- avisar y parar.

## 4. Seguir el skill correspondiente, de forma interactiva

Este repo ya trae los tres publicados en `.claude/skills/` -- no hace falta que el
usuario escriba el slash command a mano, podés seguir las instrucciones del archivo
correspondiente vos directamente, según el `role` del paso 3:

- **`developer` / `project_manager`** → `.claude/skills/scrum-sync/SKILL.md`
- **`product_owner`** → `.claude/skills/po-sync/SKILL.md`
- **`tester` / `qa`** → `.claude/skills/qa-sync/SKILL.md`

Cada uno explica qué leer del proyecto y qué llamadas hacer contra
`$SCRUM_API_URL/api/v1/*` -- ya podés saltear sus propios pasos de credenciales/rol,
porque los pasos 1-3 de acá ya los cubrieron.

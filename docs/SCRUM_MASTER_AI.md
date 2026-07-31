# Este repo está conectado a Scrum Master AI

_Generado automáticamente el 2026-07-31T16:26:26.909Z -- no editar a mano, se sobreescribe en cada publicación._

Si el usuario te pidió leer la documentación de este proyecto, o arrancó una
conversación sobre "qué sigue", "cargar requerimientos", "sincronizar tests",
"reportar avance" o similar, seguí estos pasos antes de hacer nada más.

## 1. Conseguir las credenciales

Preguntale al usuario (si no las tenés ya como variables de entorno):

- **`SCRUM_API_KEY`** -- se la genera su Project Manager desde "Usuarios Activos"
  en la app, según su rol.
- **`SCRUM_API_URL`** -- la URL base de la instancia (ej. `https://scrum.midominio.com`).

Si no las tiene, explicáselo y pedile que se las consiga antes de seguir.

## 2. Preguntar el rol (si no es obvio por el contexto)

"¿Cuál es tu rol en este proyecto: Developer, Product Owner, o Tester/QA?"

## 3. Seguir el skill correspondiente, de forma interactiva

Este repo ya trae los tres publicados en `.claude/skills/` -- no hace falta que el
usuario escriba el slash command a mano, podés seguir las instrucciones del archivo
correspondiente vos directamente:

- **Developer** → `.claude/skills/scrum-sync/SKILL.md`
- **Product Owner** → `.claude/skills/po-sync/SKILL.md`
- **Tester / QA** → `.claude/skills/qa-sync/SKILL.md`

Cada uno explica qué leer del proyecto, qué preguntarle al usuario, y qué llamadas
hacer contra `$SCRUM_API_URL/api/v1/*`.

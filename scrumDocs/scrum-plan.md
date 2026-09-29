# Plan de Requerimientos — Profesionales

_Generado automáticamente el 2026-09-29T13:30:29.641Z — no editar a mano, se sobreescribe en cada publicación._

Orden sugerido de desarrollo (respeta dependencias entre Requerimientos). Cada fila indica de qué Requerimientos depende, si tiene.

| Orden | Código | Requerimiento | Historia de Usuario | Módulo | Entrega | Estado | Desarrollador | Depende de | Rechazos |
|---|---|---|---|---|---|---|---|---|---|
| 1 | RF-01 | Interfaz gráfica de chat y bienvenida | HU-01 | — | — | production ✓✓ | dev | — | — |
| 2 | RF-06 | Reimplementar la interfaz de chat y bienvenida sobre React + Vite | HU-01 | — | — | Hacer | dev | RF-01 | — |
| 3 | RF-02 | Autenticación de usuarios (Inicio de Sesión) | HU-01 | — | — | Hacer | dev | RF-01, RF-06 | — |
| 4 | RF-04 | Validación de coincidencia de contraseñas | HU-01 | — | — | Hacer | dev | RF-01, RF-06 | — |
| 5 | RF-05 | Notificación y control de correo duplicado | HU-01 | login plus | — | Hacer | dev | RF-04, RF-06 | — |
| 6 | RF-03 | Registro de usuarios con perfil prestador de servicios | HU-01 | — | — | Hacer | dev | RF-04, RF-05, RF-06 | — |
| 7 | RNF-01 | Ocultamiento y visibilidad toggle en campos de contraseña | HU-01 | — | — | Hacer | dev | RF-02, RF-03, RF-06 | — |

## Detalle

### RF-01 — Interfaz gráfica de chat y bienvenida
Entrega de RF-01: interfaz estatica (HTML + CSS + JS, sin backend) con asistente de chat en la raiz, bienvenida automatica y rutas a login/registro.

| Condicion de aprobacion | Cubierta | Como se prueba |
|---|---|---|
| 1. Al cargar la raiz se renderiza la interfaz completa (marca Profesionales, Asistente en linea, #messages-list, #options-container, #chat-input) | si | test criterio 1 (jsdom) + RF-01.sh chequea los 5 ids sobre el HTML servido |
| 2. Bienvenida del asistente dentro de los 3000 ms | si | test criterio 2: cronometra el tiempo real hasta que aparece el texto (537 ms medido) |
| 3. Exactamente dos botones type=button, sin numero de opcion ni texto obligatorio | si | test criterio 3: cuenta botones, chequea type, y que no existan input[type=number], select ni inputs en #options-container |
| 4. Iniciar Sesion responde en menos de 2000 ms y retira los botones | si | test criterio 4: click real + cronometro (1162 ms medido) |
| 5. Registrarse responde en menos de 2000 ms y retira los botones | si | test criterio 5: click real + cronometro (1154 ms medido) |
| 6. El texto libre enruta los 4 casos y siempre vacia #chat-input | si | test criterio 6: los 4 casos en la misma sesion, verifica el valor del campo en cada uno |
| 7. El texto del usuario se muestra literal y no ejecuta HTML | si | test criterio 7: inyecta img onerror + script; FALLA con el codigo anterior, PASA con este |
| 8. La interfaz aplica docs/style.md (Inter, #2563eb, 48px, 0.15s/0.22s) | si | test criterio 8: lee index.html y styles.css |

Las 8 estan cubiertas. 8/8.

Correccion incluida: appendMessage() usaba innerHTML para el texto del usuario, asi que un <img onerror> o <script> tecleado entraba al DOM. Ahora el texto del usuario va por textContent y el innerHTML queda reservado a los literales del propio archivo.

Suite del repo: npm test, 8 tests con jsdom, 8/8 en verde. El repo no tenia package.json ni framework de tests en ninguna rama; se agrego jsdom como unica dependencia (devDependency).
Entrega: scrumDocs/entregas/RF-01.md (documento) y RF-01.sh (recorrido integrado con --carga N). RF-01.sh cierra con exit 0; con --carga 50: 50/50 respuestas 200, 2 ms promedio, 22 ms peor.
Tests de la app: 16 (8 condiciones x 2 etapas). 8 de desarrollo en Aprobado (la suite local esta en verde), 8 de integracion en Pendiente a proposito: en esta rama no hay integracion que probar. Los 16 tienen bloque verification con endpointUrl, notes y steps.

Quedo afuera: login y registro reales (RF-02 y RF-03, todavia en to_do); automatizacion en navegador real (la suite corre sobre jsdom, no pinta pixeles); medicion de accesibilidad con lector de pantalla. El unico punto que no se puede verificar desde la app de Scrum es CORS: python -m http.server no manda Access-Control-Allow-Origin, y este proyecto no tiene ningun Requerimiento operacional que lo cubra, asi que no lo meti de contrabando en esta tarjeta. Si QA necesita ese entorno, hay que abrir una tarjeta para CORS (solo el origen de la instancia, solo en settings de desarrollo).

Rama: feature/general/req-1785771199977-interfaz-grafica-de-chat-y-bienvenida, commit ed86993, PR #1 abierto hacia dev. La rama esta atrasada respecto de dev (dev avanzo hasta a858328); la interseccion de archivos entre mi rama y dev es vacia, asi que el merge no deberia tener conflictos.
- Estimado: 5h

### RF-06 — Reimplementar la interfaz de chat y bienvenida sobre React + Vite
- Estimado: 8h

### RF-02 — Autenticación de usuarios (Inicio de Sesión)
- Estimado: 5h

### RF-04 — Validación de coincidencia de contraseñas
- Estimado: 5h

### RF-05 — Notificación y control de correo duplicado
- Estimado: 5h

### RF-03 — Registro de usuarios con perfil prestador de servicios
- Estimado: 5h

### RNF-01 — Ocultamiento y visibilidad toggle en campos de contraseña
- Estimado: 5h

#!/usr/bin/env bash
# RF-01 — Interfaz gráfica de chat y bienvenida.
# Recorrido completo, ya integrado. No requiere configuración previa.
#
#   bash scrumDocs/entregas/RF-01.sh
#   bash scrumDocs/entregas/RF-01.sh --base http://localhost:8099
#   bash scrumDocs/entregas/RF-01.sh --carga 200
#
# Si el puerto está libre lo usamos. Si está ocupado por ESTA app, la usamos.
# Si está ocupado por otra cosa, buscamos el siguiente puerto libre.
#
# Requiere: bash, curl, node (>= 20) con `npm install` ya corrido, y
# python3/python sólo si hay que levantar el servidor.
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

BASE_URL=""
CARGA=0
ARRANCADO_POR_NOSOTROS=""
PID=""
NUESTROS_IDS="id=\"messages-list\""

while [ $# -gt 0 ]; do
  case "$1" in
    --base)  BASE_URL="$2"; shift 2 ;;
    --carga) CARGA="$2"; shift 2 ;;
    *) echo "opcion desconocida: $1" >&2; exit 2 ;;
  esac
done

limpiar() {
  if [ -n "$ARRANCADO_POR_NOSOTROS" ] && [ -n "$PID" ]; then
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
    echo "servidor local detenido (pid $PID)"
  fi
}
trap limpiar EXIT

http_get()   { curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$1"; }
responde()   { curl -s --max-time 3 "$1" >/dev/null 2>&1; }
es_nuestra() { curl -s --max-time 5 "$1/" | grep -q "$NUESTROS_IDS"; }

# --- 1. Elegir dónde servir -------------------------------------------------
if [ -n "$BASE_URL" ]; then
  if ! es_nuestra "$BASE_URL"; then
    echo "FALLO: $BASE_URL no sirve esta app (falta #messages-list)." >&2
    echo "       ¿Está ocupado el puerto por otro proyecto?" >&2
    exit 1
  fi
else
  for p in 3000 3001 3002 3003 3004 3005; do
    if ! responde "http://localhost:$p/"; then
      PUERTO="$p"; BASE_URL="http://localhost:$p"; break
    fi
    if es_nuestra "http://localhost:$p"; then
      PUERTO="$p"; BASE_URL="http://localhost:$p"; break
    fi
    echo "  (puerto $p ocupado por otro proceso, sigo buscando)"
  done
  [ -z "$BASE_URL" ] && { echo "FALLO: no encontre puerto libre entre 3000 y 3005." >&2; exit 1; }
fi

# --- 2. Levantar el servidor si hace falta ----------------------------------
if ! es_nuestra "$BASE_URL"; then
  PUERTO="${BASE_URL##*:}"; PUERTO="${PUERTO%/}"
  echo "==> Levantando servidor local en el puerto $PUERTO"
  if command -v python3 >/dev/null 2>&1; then PY=python3
  elif command -v python >/dev/null 2>&1; then PY=python
  else
    echo "FALLO: no hay python3 ni python en el PATH." >&2
    exit 1
  fi
  "$PY" -m http.server "$PUERTO" >/dev/null 2>&1 &
  PID=$!
  ARRANCADO_POR_NOSOTROS=1
  for _ in 1 2 3 4 5 6; do
    sleep 1
    es_nuestra "$BASE_URL" && break
  done
  if ! es_nuestra "$BASE_URL"; then
    echo "FALLO: no pude levantar la app en $BASE_URL" >&2
    exit 1
  fi
fi

echo "==> Recorrido integrado contra $BASE_URL"
FALLOS=0

# --- 3. Recursos que la interfaz promete ------------------------------------
for recurso in "/" "/styles.css" "/app.js"; do
  codigo="$(http_get "$BASE_URL$recurso")"
  if [ "$codigo" = "200" ]; then
    echo "  OK   GET $recurso -> 200"
  else
    echo "  FALLO GET $recurso -> $codigo"
    FALLOS=$((FALLOS + 1))
  fi
done

# --- 4. Selectores clave, sobre el HTML servido -----------------------------
html="$(curl -s --max-time 10 "$BASE_URL/")"
for id in "messages-list" "options-container" "chat-input" "chat-form" "main-header"; do
  if printf '%s' "$html" | grep -q "id=\"$id\""; then
    echo "  OK   #id presente en el HTML: $id"
  else
    echo "  FALLO falta #id en el HTML: $id"
    FALLOS=$((FALLOS + 1))
  fi
done

# --- 5. Las 8 condiciones de aprobación -------------------------------------
echo "==> npm test (8 condiciones de aprobación de RF-01)"
if npm test; then
  echo "  OK   suite en verde"
else
  echo "  FALLO suite en rojo"
  FALLOS=$((FALLOS + 1))
fi

# --- 6. Modo carga ----------------------------------------------------------
if [ "$CARGA" -gt 0 ]; then
  echo "==> Carga: $CARGA corridas contra $BASE_URL/"
  acumulado=0; peor=0; ok=0
  i=1
  while [ "$i" -le "$CARGA" ]; do
    salida="$(curl -s -o /dev/null --max-time 10 \
      -w '%{http_code} %{time_total}' "$BASE_URL/")" || salida="000 0"
    codigo="${salida%% *}"
    segundos="${salida##* }"
    ms="$(awk -v s="$segundos" 'BEGIN { printf "%d", s * 1000 + 0.5 }')"
    acumulado=$((acumulado + ms))
    [ "$ms" -gt "$peor" ] && peor=$ms
    [ "$codigo" = "200" ] && ok=$((ok + 1))
    i=$((i + 1))
  done
  prom=$((acumulado / CARGA))
  echo "  corridas: $CARGA | 200 OK: $ok | fallaron: $((CARGA - ok))"
  echo "  latencia GET /  promedio: ${prom} ms | peor: ${peor} ms"
fi

echo
if [ "$FALLOS" -eq 0 ]; then
  echo "RESULTADO: OK — RF-01 verificado"
  exit 0
fi
echo "RESULTADO: FALLO — $FALLOS verificacion(es) sin pasar"
exit 1

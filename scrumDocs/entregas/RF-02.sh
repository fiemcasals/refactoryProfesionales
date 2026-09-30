#!/usr/bin/env bash
# RF-02 — Autenticación de usuarios (Inicio de Sesión). Full-stack.
# Recorrido completo, ya integrado. No requiere configuración previa.
#
#   bash scrumDocs/entregas/RF-02.sh
#   bash scrumDocs/entregas/RF-02.sh --base http://localhost:8099
#   bash scrumDocs/entregas/RF-02.sh --carga 100
#
# Levanta Django (:8000) y el frontend compilado, verifica salud + login
# válido/inválido + recursos, y corre las dos suites. Mata todo al terminar.
#
# Requiere: bash, curl, node (>= 20) con `npm install` en frontend/,
# y python con `pip install -r backend/requirements.txt`.
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

BASE_URL=""
CARGA=0
DJANGO="http://localhost:8000"
PIDS=""
TMPDIR_RECORRIDO="$(mktemp -d)"

limpiar() {
  for p in $PIDS; do kill "$p" 2>/dev/null; done
  wait 2>/dev/null
  rm -rf "$TMPDIR_RECORRIDO"
  [ -n "$PIDS" ] && echo "servidores locales detenidos"
}
trap limpiar EXIT

http_get()   { curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$1"; }
responde()   { curl -s --max-time 3 "$1" >/dev/null 2>&1; }
es_frontend(){ curl -s --max-time 5 "$1/" | grep -q 'id="root"'; }

while [ $# -gt 0 ]; do
  case "$1" in
    --base)  BASE_URL="$2"; shift 2 ;;
    --carga) CARGA="$2"; shift 2 ;;
    *) echo "opcion desconocida: $1" >&2; exit 2 ;;
  esac
done

FALLOS=0
falla() { echo "  FALLO $1"; FALLOS=$((FALLOS + 1)); }
ok()    { echo "  OK   $1"; }

# --- 0. Backend: migrar, sembrar, levantar ----------------------------------
echo "==> Backend Django en $DJANGO"
python backend/manage.py migrate >/dev/null 2>&1 || { echo "FALLO: migrate"; exit 1; }
python backend/manage.py seed_user >/dev/null 2>&1
python backend/manage.py runserver 8000 >/dev/null 2>&1 &
PIDS="$PIDS $!"
for _ in 1 2 3 4 5 6 7 8; do
  sleep 1
  responde "$DJANGO/api/health/" && break
done
responde "$DJANGO/api/health/" || { echo "FALLO: Django no levanto"; exit 1; }
echo "  OK   Django responde"

# --- 1. Backend: salud + login ----------------------------------------------
[ "$(http_get "$DJANGO/api/health/")" = "200" ] \
  && ok "GET /api/health/ -> 200" \
  || falla "GET /api/health/"

printf '{"email":"qa@profesionales.local","password":"Profesionales123"}' > "$TMPDIR_RECORRIDO/ok.json"
printf '{"email":"nadie@profesionales.local","password":"x"}' > "$TMPDIR_RECORRIDO/mal.json"
resp_ok="$(curl -s --max-time 10 -X POST "$DJANGO/api/auth/login/" -H 'Content-Type: application/json' --data-binary "@$TMPDIR_RECORRIDO/ok.json")"
resp_mal="$(curl -s --max-time 10 -w ' [%{http_code}]' -X POST "$DJANGO/api/auth/login/" -H 'Content-Type: application/json' --data-binary "@$TMPDIR_RECORRIDO/mal.json")"
case "$resp_ok" in
  *'"token"'*'"email":"qa@profesionales.local"'*) ok "POST login valido -> 200 con token y email" ;;
  *) falla "POST login valido -> $resp_ok" ;;
esac
case "$resp_mal" in
  *'Credenciales no válidas.'*' [401]') ok "POST login invalido -> 401 generico" ;;
  *) falla "POST login invalido -> $resp_mal" ;;
esac

# --- 2. Frontend: compilar ---------------------------------------------------
echo "==> npm run build"
(cd frontend && npm run build) >/dev/null 2>&1 \
  && ok "compilacion sin errores" \
  || { echo "FALLO: la compilacion"; exit 1; }

# --- 3. Frontend: servir -----------------------------------------------------
if [ -n "$BASE_URL" ]; then
  es_frontend "$BASE_URL" || { echo "FALLO: $BASE_URL no sirve esta app." >&2; exit 1; }
else
  for p in 3000 3001 3002 3003 3004 3005; do
    if ! responde "http://localhost:$p/"; then
      PUERTO="$p"; BASE_URL="http://localhost:$p"; break
    fi
    if es_frontend "http://localhost:$p"; then
      PUERTO="$p"; BASE_URL="http://localhost:$p"; break
    fi
    echo "  (puerto $p ocupado por otro proceso, sigo buscando)"
  done
  [ -z "$BASE_URL" ] && { echo "FALLO: no encontre puerto libre entre 3000 y 3005." >&2; exit 1; }
fi

if ! es_frontend "$BASE_URL"; then
  PUERTO="${BASE_URL##*:}"; PUERTO="${PUERTO%/}"
  echo "==> Sirviendo frontend/dist en el puerto $PUERTO"
  if command -v python3 >/dev/null 2>&1; then PY=python3
  elif command -v python >/dev/null 2>&1; then PY=python
  else echo "FALLO: no hay python." >&2; exit 1; fi
  (cd frontend/dist && "$PY" -m http.server "$PUERTO" >/dev/null 2>&1) &
  PIDS="$PIDS $!"
  for _ in 1 2 3 4 5 6; do sleep 1; es_frontend "$BASE_URL" && break; done
  es_frontend "$BASE_URL" || { echo "FALLO: no pude levantar el frontend." >&2; exit 1; }
fi

echo "==> Recorrido integrado contra $BASE_URL"
[ "$(http_get "$BASE_URL/")" = "200" ] \
  && ok "GET / -> 200" \
  || falla "GET /"
html="$(curl -s --max-time 10 "$BASE_URL/")"
recursos="$(printf '%s' "$html" | grep -oE '(src|href)="/assets/[^"]+"' | sed -E 's/^(src|href)="//; s/"$//' | sort -u)"
[ -z "$recursos" ] && falla "no hay assets compilados en el HTML"
while IFS= read -r recurso; do
  [ -z "$recurso" ] && continue
  [ "$(http_get "$BASE_URL$recurso")" = "200" ] \
    && ok "GET $recurso -> 200" \
    || falla "GET $recurso"
done <<EOF
$recursos
EOF

# --- 4. Las dos suites -------------------------------------------------------
echo "==> Suite backend (9 tests Django)"
python backend/manage.py test accounts 2>&1 | tail -3
[ "${PIPESTATUS[0]}" -eq 0 ] && ok "backend en verde" || falla "backend en rojo"

echo "==> Suite frontend (13 tests Vitest)"
(cd frontend && npm test) 2>&1 | tail -4
[ "${PIPESTATUS[0]}" -eq 0 ] && ok "frontend en verde" || falla "frontend en rojo"

# --- 5. Modo carga -----------------------------------------------------------
if [ "$CARGA" -gt 0 ]; then
  for objetivo in "$DJANGO/api/health/" "$BASE_URL/"; do
    echo "==> Carga: $CARGA corridas contra $objetivo"
    acumulado=0; peor=0; okc=0
    i=1
    while [ "$i" -le "$CARGA" ]; do
      salida="$(curl -s -o /dev/null --max-time 10 \
        -w '%{http_code} %{time_total}' "$objetivo")" || salida="000 0"
      codigo="${salida%% *}"
      segundos="${salida##* }"
      ms="$(awk -v s="$segundos" 'BEGIN { printf "%d", s * 1000 + 0.5 }')"
      acumulado=$((acumulado + ms))
      [ "$ms" -gt "$peor" ] && peor=$ms
      [ "$codigo" = "200" ] && okc=$((okc + 1))
      i=$((i + 1))
    done
    echo "  corridas: $CARGA | 200 OK: $okc | fallaron: $((CARGA - okc))"
    echo "  latencia promedio: $((acumulado / CARGA)) ms | peor: ${peor} ms"
  done
fi

echo
if [ "$FALLOS" -eq 0 ]; then
  echo "RESULTADO: OK — RF-02 verificado"
  exit 0
fi
echo "RESULTADO: FALLO — $FALLOS verificacion(es) sin pasar"
exit 1

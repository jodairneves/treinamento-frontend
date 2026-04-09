#!/bin/sh
set -e

# Garante que API_URL tem valor padrao e termina sem barra
API_URL="${API_URL:-http://backend:3000}"
API_URL=$(echo "$API_URL" | sed 's:/*$::')
export API_URL

echo "==> API_URL = $API_URL"

# Substitui variaveis de ambiente no template do nginx
envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Testa a configuracao do nginx antes de iniciar
nginx -t

# Inicia o nginx
exec nginx -g 'daemon off;'

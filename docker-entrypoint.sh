#!/bin/sh
set -e

# Substitui variaveis de ambiente no template do nginx
envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Inicia o nginx
exec nginx -g 'daemon off;'

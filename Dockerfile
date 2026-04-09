FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

# Instala envsubst (geralmente ja vem no nginx:alpine)
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Valor padrao da API (pode ser sobrescrito no Coolify)
ENV API_URL=http://backend:3000

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]

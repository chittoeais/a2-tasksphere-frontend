FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/env-config.sh /docker-entrypoint.d/env-config.sh

ENV API_URL=http://localhost:8000

RUN chmod +x /docker-entrypoint.d/env-config.sh
EXPOSE 80

# Étape build
FROM node:25-alpine3.22 AS build

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

ARG VITE_API_URL=
ARG VITE_BACKEND_URL=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm install -g npm@11.11.0 --no-audit --no-fund

COPY package.json package-lock.json ./

# Installer toutes les dépendances (dev inclus pour build)
RUN npm ci --no-audit --no-fund

COPY index.html ./
COPY vite.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY src ./src
COPY public ./public

RUN chown -R app:app /app

# Build en tant qu'utilisateur non root
USER app
RUN npm run build

# Étape production
FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
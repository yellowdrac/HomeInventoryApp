# HomeInventory frontend (React 19 + Vite) served as static files by nginx.
# Uses Yarn 4 (Berry) via Corepack, matching the repository's yarn.lock.

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Build-time public configuration. Vite inlines VITE_* values into the bundle, so
# these are public (not secrets) and must be provided at build time.
ARG VITE_API_URL
ARG VITE_PUBLIC_APP_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL

# Enable the Yarn version Corepack ships and install dependencies first (cached
# until the manifest or lockfile changes).
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Build the production bundle.
COPY . .
RUN yarn build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ENV CI=false
ENV NODE_ENV=production

# Copy package files first (better layer caching)
COPY package*.json ./

# Install all dependencies including peer deps
# react-is is installed explicitly to fix recharts 3.x peer dep issue
RUN npm install --legacy-peer-deps --no-audit --no-fund && \
    npm install react-is --legacy-peer-deps --no-audit --no-fund

# Copy source files and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

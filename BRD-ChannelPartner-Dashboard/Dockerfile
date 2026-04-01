# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Set env to avoid interactive prompts and treat warnings as non-fatal
ENV CI=false
ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy all source files
COPY . .

# Build the app (CI=false prevents warnings from failing the build)
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

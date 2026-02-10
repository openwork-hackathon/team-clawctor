# =============================================================================
# Base Stage - Common dependencies for all services
# =============================================================================
FROM oven/bun:1-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/
COPY packages/db/package.json ./packages/db/

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY packages ./packages

# =============================================================================
# DB Stage - Prisma client generation
# =============================================================================
FROM base AS db

WORKDIR /app/packages/db

# Generate Prisma Client
RUN bun run prisma:generate

# =============================================================================
# API Build Stage - Build API service
# =============================================================================
FROM base AS api-builder

WORKDIR /app

# Copy generated Prisma client from db stage
COPY --from=db /app/packages/db ./packages/db

# API source is already copied in base stage
# No additional build step needed for Bun

# =============================================================================
# API Production Stage - Final API image
# =============================================================================
FROM oven/bun:1-alpine AS api

WORKDIR /app

# Install production dependencies only
COPY package.json bun.lockb ./
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/

RUN bun install --frozen-lockfile --production

# Copy application code
COPY packages/api ./packages/api
COPY packages/db ./packages/db

# Copy generated Prisma client
COPY --from=db /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=db /app/node_modules/@prisma ./node_modules/@prisma

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R bun:bun /app

USER bun

# Expose API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Run database migrations and start server
WORKDIR /app/packages/api
CMD ["sh", "-c", "cd ../db && bunx prisma migrate deploy && cd ../api && bun src/index.ts"]

# =============================================================================
# Web Build Stage - Build frontend with Vite
# =============================================================================
FROM base AS web-builder

WORKDIR /app/packages/web

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN bun run build

# =============================================================================
# Web Production Stage - Serve with Nginx
# =============================================================================
FROM nginx:alpine AS web

# Copy built static files
COPY --from=web-builder /app/packages/web/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx-web.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Dockerfile for PharmaScan-API
# ---------- STAGE 1: builder ----------
# Use a stable Node base with apt available (Debian slim).
FROM node:18-bullseye-slim AS builder

# Set working directory inside the image
WORKDIR /usr/src/app

# Install system packages needed for building native modules and Tesseract runtime.
# - --no-install-recommends keeps the image smaller.
# - remove apt lists after install to reduce layer size.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    make \
    g++ \
    pkg-config \
    libvips-dev \
    libjpeg-dev \
    libpng-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifests first to leverage Docker layer cache for npm install.
COPY package*.json ./

# Install node modules (devDependencies kept for build if necessary)
RUN npm ci

# Copy application source
COPY . .

# Run project build if present (tsc, bundler, etc.). If no build script exists, this will continue.
RUN npm run build || echo "info: no build step defined"

# ---------- STAGE 2: runtime ----------
FROM node:18-bullseye-slim AS runtime

WORKDIR /usr/src/app

# Install only runtime system packages required (tesseract + libvips runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libvips42 || true \
    libjpeg-dev \
    libpng-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
  && rm -rf /var/lib/apt/lists/*

# Copy node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy app code (prefer dist if built)
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port (documentational)
EXPOSE 3000

# Use non-root user (official node image provides 'node' user)
USER node

# Start command
# - Prefer the project's start script; most repos define "start" in package.json.
# - If your start script runs the compiled server (e.g., node dist/server.js), this will work.
CMD ["npm", "start"]

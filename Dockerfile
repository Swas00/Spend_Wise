# -------------------------------------------------------------
# Stage 1: Build the Vite React Frontend
# -------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Node Runtime
# -------------------------------------------------------------
FROM node:20-alpine
WORKDIR /app

# Install production backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source code
COPY backend/ ./backend/

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PORT=5001
ENV NODE_ENV=production

EXPOSE 5001

CMD ["node", "backend/server.js"]

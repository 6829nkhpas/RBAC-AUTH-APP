# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for compiling native packages
RUN apk add --no-cache python3 make g++

COPY package*.json tsconfig.json ./
RUN npm ci

# Copy database schema and generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source and build TypeScript to JavaScript
COPY src ./src/
RUN npm run build

# ==========================================
# STAGE 2: Runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy build artifacts and generated Prisma Client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/src/server.js"]

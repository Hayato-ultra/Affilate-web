FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npx tsc

FROM node:20-alpine AS runner

WORKDIR /app
RUN apk add --no-cache chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

COPY package.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/api/server.js"]

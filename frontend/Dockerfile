# Builder stage
FROM node:21-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:21-alpine AS production

WORKDIR /app

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

COPY --from=builder /app/package.json ./package.json

RUN npm install next

CMD ["npm", "start"]

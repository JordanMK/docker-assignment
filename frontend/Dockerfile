# Base stage
FROM node:21-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Production stage
FROM base AS production

ARG NEXT_PUBLIC_API_URL

RUN NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} npm run build

RUN npm install --production

CMD ["npm", "run", "prod"]

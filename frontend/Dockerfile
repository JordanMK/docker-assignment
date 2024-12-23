FROM node:21-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Development stage
FROM base AS development

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

RUN npm run build

RUN npm install --production

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]


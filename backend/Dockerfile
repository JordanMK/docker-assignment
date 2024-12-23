FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Development stage
FROM base AS development

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]

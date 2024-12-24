FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Production stage
FROM base AS production

RUN npm install --production

CMD ["npm", "start"]

# Docker & Cloud Computing assignment
## Prerequisites
- Docker
- A MERN stack app (ex. [taskfyer](https://github.com/Maclinz/taskfyer)

## Structure
The file structure looks like this
```shell
├── /backend
├── /frontend
```

## Docker
### Prerequisites
- Docker (desktop)

### Instructions
1. Navigate to your frontend directory
2. Create a Dockerfile
```Dockerfile
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
```
3. Create a .dockerignore file
```shell
# Node modules and npm debug logs
node_modules
npm-debug.log
yarn-error.log
.pnpm-debug.log

# Environment files
*.env
.env*

# Build outputs
.next
out
dist

# Editor-specific files
.vscode
.idea
.DS_Store
*.swp
*.swo

# Docker files
Dockerfile
docker-compose.yml

# Git-related files
.git
.gitignore

# Logs
logs
*.log
```

4. Do the same for the backend
5. Create a Dockerfile
```Dockerfile
# Base stage
FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Production stage
FROM base AS production

RUN npm install --production

CMD ["npm", "start"]
```
6. Create a .dockerignore file
```shell
# Node modules and npm logs
node_modules
npm-debug.log
yarn-error.log
.pnpm-debug.log

# Environment files
*.env
.env*

# Build outputs
dist
build

# Logs
logs
*.log

# Editor-specific files
.vscode
.idea
.DS_Store
*.swp
*.swo

# Docker files
Dockerfile
docker-compose.yml

# Git-related files
.git
.gitignore

# Temporary files
*.tmp
*.bak
```
### Docker Compose
1. Make a new docker directory in the root directory
```shell
├── /backend
├── /frontend
├── /docker
```
2. In the docker directory, create a docker-compose.yml file
```yaml
name: taskfyer

services:
  frontend:
    build:
      context: ../frontend
      target: production
    env_file: ../frontend/prod.env
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost/api/v1
    depends_on:
      - backend
    networks:
      - taskfyer_network

  backend:
    build:
      context: ../backend
      target: production
    env_file: ../backend/prod.env
    environment:
      - CLIENT_URL=http://localhost
    depends_on:
      - mongodb
    networks:
      - taskfyer_network

  mongodb:
    image: mongo
    container_name: mongodb
    volumes:
      - mongodb_data:/data/db
    networks:
      - taskfyer_network

volumes:
  mongodb_data:

networks:
  taskfyer_network:
    driver: bridge
```

>[!IMPORTANT]
>Both the frontend and backend use an env file to set their environment variables.

Now the folder structure should somewhat look like this
```shell
├── /backend
│   └── prod.env
│   └── Dockerfile
│   └── .dockerignore
│   └── ...
├── /frontend
│   └── prod.env
│   └── Dockerfile
│   └── .dockerignore
│   └── ...
├── /docker
│   └── docker-compose.yml
```

Now we will use nginx to serve the frontend and backend

### Nginx
1. create a new nginx directory in the root directory
```shell
├── /backend
├── /frontend
├── /docker
├── /nginx
```
2. In the nginx directory, create a nginx.conf file
>[!IMPORTANT]
> use the docker-compose.yml file to get the names of the containers

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
3. Now in the docker directory, add a new nginx service
```yaml
name: taskfyer

services:
  frontend:
    build:
      context: ../frontend
      target: production
    env_file: ../frontend/prod.env
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost/api/v1
    depends_on:
      - backend
    networks:
      - taskfyer_network

  backend:
    build:
      context: ../backend
      target: production
    env_file: ../backend/prod.env
    environment:
      - CLIENT_URL=http://localhost
    depends_on:
      - mongodb
    networks:
      - taskfyer_network

  mongodb:
    image: mongo
    container_name: mongodb
    volumes:
      - mongodb_data:/data/db
    networks:
      - taskfyer_network

  # New nginx service
  nginx:
    image: nginx
    volumes:
      - ../nginx/nginx.conf:/etc/nginx/conf.d/default.conf 
    ports:
      - "80:80"
    depends_on:
      - backend
      - frontend
    networks:
      - taskfyer_network

volumes:
  mongodb_data:

networks:
  taskfyer_network:
    driver: bridge
```

Now the folder structure should look like this
```shell
├── /backend
│   └── prod.env
│   └── Dockerfile
│   └── .dockerignore
│   └── ...
├── /frontend
│   └── prod.env
│   └── Dockerfile
│   └── .dockerignore
│   └── ...
├── /docker
│   └── docker-compose.yml
├── /nginx
│   └── nginx.conf
```

### Running the containers
>[!IMPORTANT]
> Your docker compose command could look different depending on your setup
1. After you have created the docker-compose.yml file, run the following command in the docker directory
```shell
docker compose up -d --build
```
2. You should now be able to access the app at http://localhost

### Docker Hub
To set up for kubernetes, we need to push the images to [Docker Hub](https://hub.docker.com/)

1. If you don't already have a Docker Hub account, create one 
2. Once you have logged into Docker Hub, run the following command your terminal
> For me this would be: docker login -u jordanvives
```shell
docker login -u <your_dockerhub_username>
```
4. And enter your password
Now you should be able to push the images to Docker Hub

1. In the frontend directory, run the following command to build the image
> For me this would be: docker build -t jordanvives/taskfyer:latest .
```shell
docker build -t <your_dockerhub_username>/<your_image_name>:<your_image_tag> .
```
2. Also do the same in the backend directory
> For me this would be: docker build -t jordanvives/taskfyer-api:latest .
3. Push the images to Docker Hub
> [!IMPORTANT]
> We will push to 2 different tags, one for the latest version and one for the dev version

> For me this would be:
> docker push jordanvives/taskfyer:latest
> docker push jordanvives/taskfyer:dev
> docker push jordanvives/taskfyer-api:latest
> docker push jordanvives/taskfyer-api:dev
```shell
docker push <your_dockerhub_username>/<your_image_name>:latest
docker push <your_dockerhub_username>/<your_image_name>:dev
```
4. Now you should be able to access the images on Docker Hub

FOTO

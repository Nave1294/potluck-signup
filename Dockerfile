FROM node:20-alpine

# Build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV DATABASE_PATH=/data/potluck.db

EXPOSE 3000

CMD ["npm", "start"]

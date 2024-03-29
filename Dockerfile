FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16-alpine
COPY --from=builder /app .

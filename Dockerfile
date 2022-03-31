FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
WORKDIR /app/dist
CMD [ "node", "bot.js" ]

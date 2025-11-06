FROM node:20
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
COPY . .
EXPOSE 8080

ENV PORT=8080
CMD ["node", "index.js"]
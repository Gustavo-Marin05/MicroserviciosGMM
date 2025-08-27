FROM node:20-bullseye

WORKDIR /src/index

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "src/index.js"]
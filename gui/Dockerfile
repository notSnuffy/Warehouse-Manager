FROM node:24

WORKDIR /app

COPY vite.config.mjs ./
COPY package.json package-lock.json ./
RUN npm install

COPY src ./src

CMD [ "npm", "run", "dev" ]

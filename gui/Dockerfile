FROM node:20

WORKDIR /app

COPY vite.config.mjs postcss.config.js tailwind.config.js ./
COPY package.json package-lock.json ./
RUN npm install

COPY src ./src

CMD [ "npm", "run", "dev" ]

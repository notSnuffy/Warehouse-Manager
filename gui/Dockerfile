FROM node:20

WORKDIR /app

COPY jsconfig.json next.config.mjs postcss.config.js tailwind.config.js ./
COPY package.json package-lock.json ./
RUN npm install

COPY public ./public
COPY src ./src

CMD [ "npm", "run", "dev" ]

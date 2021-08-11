FROM node:lts

WORKDIR /node_lessons

COPY app.ts /node_lessons/src

COPY package.json package-lock.json /node_lessons/

RUN npm install

CMD npm run dev
FROM node:lts

WORKDIR /node_lessons

COPY script.js /node_lessons

COPY package.json package-lock.json /node_lessons/

# RUN apt-get install nodejs
RUN npm install

CMD node script.js

# CMD ["node", "script.js"]
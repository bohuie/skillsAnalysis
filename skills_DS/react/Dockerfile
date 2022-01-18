FROM node

RUN npm install webpack -g

WORKDIR /tmp
COPY package.json /tmp/
RUN npm config set registry http://registry.npmjs.org/ && npm install

WORKDIR /app/react/
COPY . /app/react/
RUN cp -a /tmp/node_modules /app/react/
RUN npm install -D webpack-cli

RUN webpack

ENV NODE_ENV=development
ENV PORT=4000

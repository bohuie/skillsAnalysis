FROM node

WORKDIR /tmp
COPY package.json /tmp/
ENV NODE_ENV=development
RUN npm install

WORKDIR /home/node/
COPY package.json /home/node/
ENV NODE_ENV=development
RUN npm install
RUN npm install -D webpack-cli
RUN npm install -D webpack
ENV PATH=/home/node/node_modules/.bin:$PATH

WORKDIR /home/node/react/
COPY . /home/node/react/

RUN npx webpack

ENV NODE_ENV=development
RUN npm install

WORKDIR /app
COPY package.json /app/
WORKDIR /home/node/
COPY package.json /home/node/
ENV NODE_ENV=development
RUN npm install
RUN npm install -D webpack-cli
RUN npm install -D webpack
ENV PATH=/app/node_modules/.bin:$PATH
ENV PATH=/home/node/node_modules/.bin:$PATH

WORKDIR /app/react/
COPY . /app/react/
WORKDIR /home/node/react/
COPY . /home/node/react/

RUN npx webpack

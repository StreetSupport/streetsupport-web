FROM node:10
    RUN npm i gulp-cli -g
    WORKDIR /app
    COPY package.json /app
    RUN npm i
    COPY . /app
    EXPOSE 3000 3001
    CMD gulp

FROM node:12-alpine
WORKDIR /usr/src/habit
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
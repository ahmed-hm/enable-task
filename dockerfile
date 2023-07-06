FROM node:18-bullseye

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm test 

RUN npm install -g @nestjs/cli 
RUN nest build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

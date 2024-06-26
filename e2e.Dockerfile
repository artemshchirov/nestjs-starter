FROM node:18.18.0-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli typescript ts-node

WORKDIR /tmp/app
COPY package*.json ./
RUN npm install

COPY . /usr/src/app
RUN cp -a /tmp/app/node_modules /usr/src/app
COPY ./wait-for-it.sh /opt/wait-for-it.sh
RUN chmod +x /opt/wait-for-it.sh
COPY ./startup.ci.sh /opt/startup.ci.sh
RUN chmod +x /opt/startup.ci.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.ci.sh

WORKDIR /usr/src/app
RUN if [ ! -f .env ]; then cp env-example .env; fi
RUN npm run build

CMD ["/opt/startup.ci.sh"]

# syntax=docker/dockerfile:1

FROM node:16.14.1-alpine
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD [ "node", "server.js" ]
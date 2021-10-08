# Stage: build
FROM node:16-buster AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn --no-cache

COPY . .
RUN yarn typecheck
RUN npm prune --production

# State: run
FROM node:16-buster
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .
RUN mkdir /usr/src/foxxy_files

EXPOSE 8081 8082
CMD [ "yarn", "serve" ]
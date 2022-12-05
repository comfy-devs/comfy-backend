# Stage: build
FROM node:16-alpine AS builder
WORKDIR /usr/src/app
RUN apk update
RUN apk add bash jq build-base git

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

COPY package*.json yarn.lock ./
RUN yarn --no-cache

COPY . .
RUN yarn run build
RUN yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')

# State: run
FROM node:16-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

CMD [ "yarn", "serve" ]
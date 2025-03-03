ARG NODE_VERSION=23.9.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production
WORKDIR /usr/src/app

RUN apk add --no-cache tzdata

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.npm \
    yarn install --frozen-lockfile

USER node
COPY . .

ENV TZ="Europe/Berlin"

USER root
RUN cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime && \
    echo "Europe/Berlin" > /etc/timezone

EXPOSE 9080
CMD ["yarn", "start"]
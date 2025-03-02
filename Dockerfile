ARG NODE_VERSION=23.9.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production
WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER node
COPY . .

EXPOSE 9080

CMD ["yarn", "start"]
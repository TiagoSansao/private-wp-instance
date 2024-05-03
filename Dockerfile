# === BASE === #

FROM node:18-alpine as base

RUN apk update && apk add --no-cache \
  chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

USER node

# === BUILDER === #

FROM base as builder

COPY --chown=node:node . /app
RUN yarn install && yarn run build

# === FINAL === #

FROM base as final

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/yarn.lock /app/yarn.lock

RUN yarn install

ENTRYPOINT ["npm", "run", "start:prod"] 
FROM node:16-alpine as builder

USER node
ENV NODE_ENV build

WORKDIR /home/node

COPY . /home/node

RUN yarn install --immutable --immutable-cache --check-cache \
    && yarn run build

# ---

FROM node:16-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/

CMD ["node", "dist/src/main.js"]

FROM node:10-alpine AS builder

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./
RUN npm install


FROM node:10-alpine

RUN mkdir -p /home/node/wai/node_modules && chown -R node:node /home/node/wai
WORKDIR /home/node/wai
COPY --from=builder node_modules node_modules

USER node

COPY --chown=node:node . .

EXPOSE 8000

CMD ["npm", "run", "start:prod"]

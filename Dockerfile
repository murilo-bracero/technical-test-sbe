FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine as runner

ENV NODE_ENV=production

ENV GROUP=nodeappgroup
ENV GID=10001
ENV USER=nodeappuser
ENV UID=10001

RUN addgroup --system --gid ${GID} ${GROUP}
RUN adduser --system --uid ${UID} ${USER}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder --chown=${GROUP}:${USER} /app/datasets ./datasets
COPY --from=builder --chown=${GROUP}:${USER} /app/dist ./dist

USER ${USER}

ENTRYPOINT ["npm", "run", "start"]


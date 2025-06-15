FROM node:18-alpine

# Enable Corepack and install Yarn 3
RUN corepack enable && corepack prepare yarn@3.6.3 --activate

WORKDIR /app

COPY . .

RUN yarn config set nodeLinker node-modules

RUN yarn install

RUN yarn build

EXPOSE 3000
ENV PORT 3000

CMD ["yarn", "start"]
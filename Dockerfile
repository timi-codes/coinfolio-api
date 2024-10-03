# Base: install dependencies
FROM node:18-alpine AS base

WORKDIR /user/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .


# Creating a build:
FROM node:18-alpine AS create-build
WORKDIR /user/src/app
COPY --from=base /user/src/app ./
RUN yarn run build


# Running the application:
FROM node:18-alpine AS run
WORKDIR /user/src/app

COPY --from=base /user/src/app/node_modules ./node_modules
COPY --from=create-build /user/src/app/dist ./dist
COPY package.json ./


# Prune off the dev dependencies after build step
RUN yarn install --production

USER node
EXPOSE 4000

CMD ["yarn", "run", "start:prod"]
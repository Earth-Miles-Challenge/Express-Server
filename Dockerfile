# syntax=docker/dockerfile:1.4

# ################### ###################
# STAGE 1: Base
# ################### ###################
FROM node:19-alpine3.16 AS base

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy other files
COPY . /app

# Set PORT config (9000 is the default for development)
ARG PORT=9000
ENV PORT $PORT
EXPOSE $PORT

# ################### ###################
# STAGE 2: Development
# ################### ###################
FROM base as development

# Install Nodemon globally
RUN npm i nodemon -g

# Run app using Nodemon
CMD [ "npm", "run", "start" ]

# ################### ###################
# STAGE 3: Production
# ################### ###################
FROM base as production

CMD [ "node", "./bin/www" ]

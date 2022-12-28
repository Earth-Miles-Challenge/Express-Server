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

# Set PORT config
ARG PORT=9000
ENV PORT $PORT
EXPOSE $PORT

# Check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s \
  CMD node healthcheck.js

# ################### ###################
# STAGE 2: Development
# ################### ###################
FROM base as development

# Install Nodemon globally
RUN npm i nodemon -g

# Run app using Nodemon
CMD [ "npm", "run", "start" ]

# ################### ###################
# STAGE 3: Dev-envs
# ################### ###################
FROM development as dev-envs

RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF

RUN <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF

# Install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /

# ################### ###################
# STAGE 4: Production
# ################### ###################
FROM base as production

CMD [ "node", "./bin/www" ]

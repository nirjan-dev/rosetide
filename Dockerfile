# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.9.0
# Adjust NODE_VERSION as desired
ARG DISTROLESS_NODE_VERSION=22

FROM node:${NODE_VERSION}-slim AS build

LABEL fly_launch_runtime="Node.js"
# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest
RUN corepack enable

# Node.js app lives here
WORKDIR /app
COPY . .

# Install node modules
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Build application
RUN pnpm --filter @periodos/backend build

# prune deps
RUN pnpm --filter @periodos/backend --prod deploy --legacy output

# use node slim for debugging capabilities
# FROM node:${NODE_VERSION}-slim

# use distroless for smaller image if  needed
FROM gcr.io/distroless/nodejs${DISTROLESS_NODE_VERSION}-debian12

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Copy built application
COPY --from=build /app/output /app
# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "dist/index.js" ]

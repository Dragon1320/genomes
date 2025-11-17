FROM node:24 AS builder
WORKDIR /app
RUN corepack enable
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm i --no-frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24
WORKDIR /app
RUN corepack enable
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production

# entry point
CMD ["node", "build"]

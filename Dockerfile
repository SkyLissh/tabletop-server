FROM oven/bun:1.1.20-slim as base
WORKDIR /app

FROM base as builder

RUN apt-get update && apt-get install -y python3  build-essential

RUN mkdir -p /temp/deps
COPY package.json bun.lockb /temp/deps/
RUN cd /temp/deps && bun install --frozen-lockfile

FROM base as release
COPY --from=builder /temp/deps/node_modules node_modules
COPY . .

ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]

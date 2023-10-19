FROM node:14 as deps

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

FROM node:14 as dev

WORKDIR /app

ENV NODE_COMMAND=dev
RUN npm install -g nodemon typescript

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENTRYPOINT ["sh", "-c", "npm run $NODE_COMMAND"]

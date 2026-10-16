FROM node:24

WORKDIR /server

# Install system dependencies (rarely change, so cached)
RUN apt-get update \
    && apt-get install -y --no-install-recommends nano \
    && rm -rf /var/lib/apt/lists/*

# Copy only manifest files first so dependency install is cached
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the source
COPY . .

EXPOSE 4000

CMD ["yarn", "run", "dev"]
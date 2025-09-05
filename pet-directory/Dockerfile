# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build if needed)
RUN npm install

# Copy source files
COPY . .

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy node_modules and app source from build
COPY --from=build /usr/src/app /usr/src/app

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]

# Use official node image
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy only necessary files for running
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]

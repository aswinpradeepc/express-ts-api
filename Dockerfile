# Use the latest LTS version of Node.js (currently 20.x)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application files
COPY . .

# Build TypeScript files
RUN npm run build

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["node", "dist/server.js"]

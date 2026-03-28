# Use the official lightweight Node.js image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package info
COPY package*.json ./

# Install all dependencies (including express and cors for our backend proxy)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite static files to the /dist directory
RUN npm run build

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start the secure backend server which proxies the API and serves the /dist files
CMD ["node", "server.js"]

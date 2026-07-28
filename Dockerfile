# Use Node.js version
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Copy .env file if it exists (will be created by workflow)
COPY .env* ./

# Build the application
# Environment variables from .env file will be used during build
RUN npm run build

# Remove .env file after build for security
RUN rm -f .env .env.* || true

# Install serve to serve the built files
RUN npm install -g serve

# Expose port 3060
EXPOSE 3060

# Start the application
CMD ["serve", "-s", "dist", "-l", "3060"]

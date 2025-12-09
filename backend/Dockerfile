# Use Node.js LTS version with AMD64 architecture
FROM --platform=linux/amd64 node:18-alpine
# Set working directory
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm ci --only=production
# Copy application files
COPY . .
# Create uploads directory if it doesn't exist
RUN mkdir -p uploads/audio
# Expose the port the app runs on
EXPOSE 8080
# Set environment to production
ENV NODE_ENV=production
# Start the application
CMD ["node", "app.js"]

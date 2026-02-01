FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["npm", "start"]

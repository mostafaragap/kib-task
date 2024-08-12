# # Stage 1: Build the application
# FROM node:18-alpine as builder

# # Set working directory
# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm ci

# # Copy application files
# COPY . .

# # Generate Prisma Client
# RUN npx prisma generate

# # Build the application
# RUN npm run build

# # Stage 2: Run the application
# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Copy built application and node_modules from the builder stage
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/prisma ./prisma

# # Expose the application port
# EXPOSE 3000

# # Command to run the application
# CMD ["npm", "run", "start:prod"]
# Stage 1: Build the application
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy built application and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]

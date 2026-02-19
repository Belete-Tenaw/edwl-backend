# Backend Dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Note: if npm ci fails, we can change this to npm install
RUN npm install --production

# Copy application code
COPY . .

# Generate Prisma Client (Crucial for Supabase/Postgres)
RUN npx prisma generate

# Cloud Run requires port 8080
ENV PORT 8080
EXPOSE 8080

# Start application
CMD ["npm", "start"]
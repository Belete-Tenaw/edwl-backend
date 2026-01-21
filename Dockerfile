# Build Stage for Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Setup Backend and Final Image
FROM node:18-alpine
WORKDIR /app

# Copy Backend dependencies
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

# Install all dependencies (including dev for prisma)
WORKDIR /app/backend
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Prune dev dependencies
RUN npm prune --production

# Copy Backend Source
COPY backend/ ./

# Copy Frontend Build from previous stage
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose API Port
EXPOSE 5000

# Set Env to Production
ENV NODE_ENV=production

# Start Server
CMD ["npm", "start"]

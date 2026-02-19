# Use a stable, lightweight version of Node
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the package files first to speed up the build
COPY package*.json ./

# Install dependencies (this will now work since we fixed package.json)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Render uses
EXPOSE 10000

# The start command (fixed to lowercase 'node' for Linux)
CMD ["node", "src/server.js"]
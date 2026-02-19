# Use a very stable version of Node
FROM node:18-alpine

# Create the folder where the app lives
WORKDIR /usr/src/app

# Copy the file that lists the "parts" needed
COPY package*.json ./

# Install the parts (standard command)
RUN npm install

# Copy everything else from your computer to Render
COPY . .

# Tell Render to use port 10000
EXPOSE 10000

# The command to start your engine
CMD ["node", "src/server.js"]
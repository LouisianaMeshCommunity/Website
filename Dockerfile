# Step 1: Use official Node.js image
FROM node:18 AS build

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --verbose

# Step 5: Copy the rest of the application (including public folder)
COPY . .

# Step 6: Build the application
RUN npm run build


# Step 7: Expose the port Next.js will run on
EXPOSE 3000

# Step 8: Run the app in production mode
CMD ["npm", "start"]

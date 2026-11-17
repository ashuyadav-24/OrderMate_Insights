FROM node:22-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]

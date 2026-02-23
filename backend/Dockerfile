# DentalCare+ Backend API (slim image avoids ESM resolution issues seen on Alpine)
FROM node:20-slim

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (use npm install so it works with or without lock file)
RUN npm install --omit=dev

# Copy application code (after node_modules so COPY does not overwrite)
COPY . .

# Ensure uploads dir exists
RUN mkdir -p uploads/teeth-scans

EXPOSE 4000

CMD ["node", "server.js"]

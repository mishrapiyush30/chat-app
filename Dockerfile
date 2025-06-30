# Build stage
FROM node:18-slim as builder

# Accept build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set environment variables
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create .env file for Vite
RUN echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env && \
    echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add a script to replace environment variables in index.html
COPY --from=builder /app/dist/index.html /usr/share/nginx/html/index.html.template
RUN apk add --no-cache bash
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set environment variables for Nginx
ENV VITE_SUPABASE_URL=""
ENV VITE_SUPABASE_ANON_KEY=""

# Expose port
EXPOSE 80

# Start nginx with environment variable substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 
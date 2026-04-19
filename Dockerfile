# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Khai báo các Arg để nhận giá trị từ GitHub Action
ARG VITE_API_END_POINT=/api
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_API_END_AI_POINT

# Đưa các Arg vào môi trường Build của Vite
ENV VITE_API_END_POINT=$VITE_API_END_POINT
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_N8N_WEBHOOK_URL=$VITE_N8N_WEBHOOK_URL
ENV VITE_API_END_AI_POINT=$VITE_API_END_AI_POINT

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy a custom nginx config if you need special routing (optional)
# For now, we'll use a simple one for React routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

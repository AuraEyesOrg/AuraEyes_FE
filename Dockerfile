# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Xóa bỏ các file .env cũ để ép Vite dùng biến môi trường từ Docker Build-Args
RUN rm -f .env .env.local .env.production .env.development

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

# Chạy build
# Chạy build (Bỏ qua tsc để đảm bảo ra được folder dist)
RUN npx vite build

# Kiểm tra xem có file nào trong dist không (Bạn có thể xem log ở GitHub Action)
RUN ls -la dist/

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Xóa trang mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

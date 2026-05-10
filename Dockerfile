# Etapa 1: Construcción (Usamos Node 20)
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Usamos Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Configuramos Nginx para que React Router funcione perfecto
RUN rm /etc/nginx/conf.d/default.conf
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
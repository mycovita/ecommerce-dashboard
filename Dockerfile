FROM node:20-slim
WORKDIR /app
COPY package*.json ./
# npm ci yerine npm install kullanıyoruz
RUN npm install --omit=dev
COPY . .
EXPOSE 8080
CMD ["node", "src/app.js"]

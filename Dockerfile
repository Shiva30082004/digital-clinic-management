FROM node:lts-alpine

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080
CMD ["sh", "-c", "export CHROMIUM_PATH=/usr/bin/chromium && npm start"]
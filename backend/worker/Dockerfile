FROM node:20-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    audiowaveform \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .. .

RUN npx prisma generate

CMD ["node", "config/worker.js"]

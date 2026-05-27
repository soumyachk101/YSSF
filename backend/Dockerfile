FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

USER node

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]

FROM node:20-alpine

# Force rebuild on every deploy
ARG BUILD_DATE
ENV BUILD_DATE=$BUILD_DATE

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["npm", "start"]

FROM node:22-alpine AS builder

WORKDIR /app
ENV HUSKY=0

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

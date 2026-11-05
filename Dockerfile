# Один Dockerfile для обоих приложений монорепо.
# Какое собирать — задаёт build-arg APP (см. docker-compose.yml):
#   APP=crm-server     → BFF
#   APP=users-service  → микросервис пользователей

FROM node:20-alpine

ARG APP
ENV APP=${APP}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma-клиенты обеих схем (у users-service свой, в apps/users-service/generated)
RUN npx prisma generate
RUN npx prisma generate --config apps/users-service/prisma.config.ts
RUN npx prisma generate --config apps/leads-service/prisma.config.ts
RUN npx prisma generate --config apps/crm-server/prisma-auth/prisma-auth.config.ts

RUN npx nest build ${APP}

RUN chmod +x docker/start.sh
CMD ["./docker/start.sh"]

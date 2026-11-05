#!/bin/sh
# ↑ shebang: говорит системе запускать файл через sh. Без него — "exec format error".
set -e

case "$APP" in
  crm-server)
    npx prisma migrate deploy
    npx prisma migrate deploy --config apps/crm-server/prisma-auth/prisma-auth.config.ts
    ;;
  users-service)
    npx prisma migrate deploy --config apps/users-service/prisma.config.ts
    ;;
  leads-service)
    npx prisma migrate deploy --config apps/leads-service/prisma.config.ts
    ;;
  *)
    echo "Unknown APP: $APP" >&2
    exit 1
    ;;
esac

exec node "dist/apps/$APP/main"

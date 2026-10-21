set -e

case "$APP" in
  crm-server)
    npx prisma migrate deploy
    ;;
  users-service)
    npx prisma migrate deploy --config apps/users-service/prisma.config.ts
    ;;
  *)
    echo "Unknown APP: $APP" >&2
    exit 1
    ;;
esac

exec node "dist/apps/$APP/main"

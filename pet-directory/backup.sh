#!/bin/sh
set -e

# Install required tools
apk update && apk add --no-cache postgresql-client bash coreutils findutils redis

# Wait a few seconds to ensure DB & Redis are up
sleep 10

mkdir -p /backups

DB_NAME=$(cat /run/secrets/db_name)
DB_USER=$(cat /run/secrets/db_user)
DB_PASS=$(cat /run/secrets/db_pass)

while true; do
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

    echo "Backing up Postgres..."
    PGPASSWORD=$DB_PASS pg_dump -U $DB_USER -h pet-db $DB_NAME > /backups/db_${TIMESTAMP}.sql

    echo "Backing up Redis..."
    redis-cli -h pet-redis save
    cp /data/dump.rdb /backups/redis_${TIMESTAMP}.rdb

    echo "Pruning old backups..."
    find /backups -type f -mtime +7 -delete

    echo "Backup complete!"
    sleep 3600
done

#!/bin/bash
# Docker entrypoint script for backend

set -e

echo "Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "rallyforge" -d "rallyforge_db" -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - running migrations"

# Run Alembic migrations
alembic upgrade head

echo "Starting application..."
exec "$@"


#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Create export directory if it doesn't exist
mkdir -p database/export

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Docker container name
CONTAINER_NAME="employee-mysql"

# Export database (structure + data)
echo "Exporting database: $DB_NAME (structure + data)..."
docker exec "$CONTAINER_NAME" mysqldump -u "$DB_USER" -p"$DB_PASSWORD" --no-tablespaces "$DB_NAME" > "database/export/${DB_NAME}_full_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
  echo "✅ Export successful: database/export/${DB_NAME}_full_${TIMESTAMP}.sql"
else
  echo "❌ Export failed. Make sure Docker container is running: docker ps"
  exit 1
fi

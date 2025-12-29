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

# Export database data only
echo "Exporting database data: $DB_NAME..."
docker exec "$CONTAINER_NAME" mysqldump -u "$DB_USER" -p"$DB_PASSWORD" --no-tablespaces --no-create-info "$DB_NAME" > "database/export/${DB_NAME}_data_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
  echo "✅ Export successful: database/export/${DB_NAME}_data_${TIMESTAMP}.sql"
else
  echo "❌ Export failed. Make sure Docker container is running: docker ps"
  exit 1
fi

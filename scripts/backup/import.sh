#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Docker container name
CONTAINER_NAME="employee-mysql"

# Import directory
IMPORT_DIR="database/import"

# Create import directory if it doesn't exist
mkdir -p "$IMPORT_DIR"

# Get list of SQL files
SQL_FILES=("$IMPORT_DIR"/*.sql)

# Check if any SQL files exist
if [ ! -e "${SQL_FILES[0]}" ]; then
  echo "❌ No SQL files found in $IMPORT_DIR/"
  echo "   Please place your SQL backup files in the $IMPORT_DIR/ folder"
  exit 1
fi

# Display available SQL files
echo "📁 Available SQL files in $IMPORT_DIR/:"
echo ""
counter=1
for file in "${SQL_FILES[@]}"; do
  filename=$(basename "$file")
  filesize=$(ls -lh "$file" | awk '{print $5}')
  echo "  [$counter] $filename ($filesize)"
  counter=$((counter + 1))
done

echo ""
echo -n "Select file number to import (1-$((counter-1))): "
read selection

# Validate selection
if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -ge "$counter" ]; then
  echo "❌ Invalid selection"
  exit 1
fi

# Get selected file
SELECTED_FILE="${SQL_FILES[$((selection-1))]}"
FILENAME=$(basename "$SELECTED_FILE")

# Import database
echo ""
echo "📥 Importing database from: $FILENAME..."
docker exec -i "$CONTAINER_NAME" mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SELECTED_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Import successful"
else
  echo "❌ Import failed. Make sure Docker container is running: docker ps"
  exit 1
fi

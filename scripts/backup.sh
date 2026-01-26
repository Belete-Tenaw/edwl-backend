#!/bin/bash

# EDWL Database Backup Script
# This script creates a timestamped backup of the PostgreSQL database

# Configuration
DB_NAME="edwl_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/edwl_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating backup of $DB_NAME..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
echo "Backup created: ${BACKUP_FILE}.gz"

# Clean up old backups (keep last 30 days)
find "$BACKUP_DIR" -name "edwl_backup_*.sql.gz" -mtime +30 -delete
echo "Old backups cleaned up"

# Optional: Upload to cloud storage
# aws s3 cp "${BACKUP_FILE}.gz" s3://your-bucket/backups/

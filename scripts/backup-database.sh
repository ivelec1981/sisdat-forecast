#!/bin/bash

# ===========================================
# SISDAT Forecast - Database Backup Script
# ===========================================
# Usage: ./scripts/backup-database.sh [environment]
# Environment: development|staging|production (default: development)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ENVIRONMENT="${1:-development}"

echo -e "${GREEN}===========================================\n"
echo "📦 SISDAT Forecast - Database Backup"
echo "Environment: ${ENVIRONMENT}"
echo "Timestamp: ${TIMESTAMP}"
echo -e "===========================================${NC}\n"

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    ENV_FILE="${PROJECT_ROOT}/.env.production"
elif [ "$ENVIRONMENT" = "staging" ]; then
    ENV_FILE="${PROJECT_ROOT}/.env.staging"
else
    ENV_FILE="${PROJECT_ROOT}/.env.local"
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file not found: ${ENV_FILE}${NC}"
    exit 1
fi

# Source environment file
set -a
source "$ENV_FILE"
set +a

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Function: Backup SQLite database
backup_sqlite() {
    local DB_PATH="${PROJECT_ROOT}/prisma/dev.db"
    local BACKUP_FILE="${BACKUP_DIR}/sqlite_${ENVIRONMENT}_${TIMESTAMP}.db"

    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}❌ SQLite database not found: ${DB_PATH}${NC}"
        return 1
    fi

    echo -e "${YELLOW}📋 Backing up SQLite database...${NC}"

    # Copy database file
    cp "$DB_PATH" "$BACKUP_FILE"

    # Compress
    gzip "$BACKUP_FILE"

    echo -e "${GREEN}✅ SQLite backup created: ${BACKUP_FILE}.gz${NC}"

    # Create checksum
    sha256sum "${BACKUP_FILE}.gz" > "${BACKUP_FILE}.gz.sha256"

    return 0
}

# Function: Backup PostgreSQL database
backup_postgresql() {
    local BACKUP_FILE="${BACKUP_DIR}/postgresql_${ENVIRONMENT}_${TIMESTAMP}.sql"

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL not set${NC}"
        return 1
    fi

    echo -e "${YELLOW}📋 Backing up PostgreSQL database...${NC}"

    # Extract connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_URL="${DATABASE_URL_NON_POOLING:-$DATABASE_URL}"

    # Use pg_dump with connection string
    pg_dump "$DB_URL" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --file="$BACKUP_FILE" \
        2>/dev/null || {
        echo -e "${RED}❌ pg_dump failed. Is PostgreSQL client installed?${NC}"
        return 1
    }

    # Compress
    gzip "$BACKUP_FILE"

    echo -e "${GREEN}✅ PostgreSQL backup created: ${BACKUP_FILE}.gz${NC}"

    # Create checksum
    sha256sum "${BACKUP_FILE}.gz" > "${BACKUP_FILE}.gz.sha256"

    return 0
}

# Function: Backup Prisma schema
backup_schema() {
    local SCHEMA_FILE="${PROJECT_ROOT}/prisma/schema.prisma"
    local BACKUP_FILE="${BACKUP_DIR}/schema_${ENVIRONMENT}_${TIMESTAMP}.prisma"

    if [ ! -f "$SCHEMA_FILE" ]; then
        echo -e "${RED}❌ Schema file not found: ${SCHEMA_FILE}${NC}"
        return 1
    fi

    echo -e "${YELLOW}📋 Backing up Prisma schema...${NC}"

    cp "$SCHEMA_FILE" "$BACKUP_FILE"
    gzip "$BACKUP_FILE"

    echo -e "${GREEN}✅ Schema backup created: ${BACKUP_FILE}.gz${NC}"

    return 0
}

# Function: Upload to S3 (optional)
upload_to_s3() {
    if [ -z "$BACKUP_S3_BUCKET" ]; then
        echo -e "${YELLOW}⚠️  S3 backup not configured, skipping upload${NC}"
        return 0
    fi

    echo -e "${YELLOW}☁️  Uploading to S3...${NC}"

    local BACKUP_FILES="${BACKUP_DIR}/*_${TIMESTAMP}*"

    aws s3 sync "$BACKUP_DIR" "s3://${BACKUP_S3_BUCKET}/${ENVIRONMENT}/" \
        --exclude "*" \
        --include "*_${TIMESTAMP}*" \
        --storage-class STANDARD_IA \
        2>/dev/null || {
        echo -e "${RED}❌ S3 upload failed${NC}"
        return 1
    }

    echo -e "${GREEN}✅ Backup uploaded to S3${NC}"

    return 0
}

# Function: Cleanup old backups
cleanup_old_backups() {
    local RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

    echo -e "${YELLOW}🧹 Cleaning up backups older than ${RETENTION_DAYS} days...${NC}"

    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +${RETENTION_DAYS} -delete
    find "$BACKUP_DIR" -name "*.sha256" -type f -mtime +${RETENTION_DAYS} -delete

    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function: Create backup metadata
create_metadata() {
    local METADATA_FILE="${BACKUP_DIR}/backup_${ENVIRONMENT}_${TIMESTAMP}.json"

    cat > "$METADATA_FILE" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "environment": "${ENVIRONMENT}",
  "version": "${NEXT_PUBLIC_APP_VERSION:-unknown}",
  "database_type": "$([ -f "${PROJECT_ROOT}/prisma/dev.db" ] && echo "sqlite" || echo "postgresql")",
  "backup_files": [
$(ls -1 ${BACKUP_DIR}/*_${TIMESTAMP}*.gz 2>/dev/null | sed 's/.*\//    "/' | sed 's/$/",/' | sed '$ s/,$//')
  ],
  "hostname": "$(hostname)",
  "user": "$(whoami)"
}
EOF

    echo -e "${GREEN}✅ Metadata created: ${METADATA_FILE}${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}🚀 Starting backup process...${NC}\n"

    # Detect database type
    if [ -f "${PROJECT_ROOT}/prisma/dev.db" ]; then
        echo -e "${YELLOW}Detected SQLite database${NC}"
        backup_sqlite || exit 1
    else
        echo -e "${YELLOW}Detected PostgreSQL database${NC}"
        backup_postgresql || exit 1
    fi

    # Backup schema
    backup_schema || echo -e "${YELLOW}⚠️  Schema backup failed, continuing...${NC}"

    # Create metadata
    create_metadata

    # Upload to S3 (optional)
    upload_to_s3 || echo -e "${YELLOW}⚠️  S3 upload failed, backup saved locally${NC}"

    # Cleanup old backups
    cleanup_old_backups

    # Summary
    echo -e "\n${GREEN}===========================================\n"
    echo "✅ Backup completed successfully!"
    echo "📁 Backup location: ${BACKUP_DIR}"
    echo "🕐 Timestamp: ${TIMESTAMP}"

    # Calculate total size
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "💾 Total backup size: ${TOTAL_SIZE}"

    echo -e "===========================================${NC}\n"
}

# Run main function
main

exit 0

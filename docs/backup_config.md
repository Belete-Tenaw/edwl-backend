# EDWL Backup Strategy

To ensure data integrity and disaster recovery, the following backup schedule is implemented:

## 🐘 PostgreSQL (Prisma/DB)
- **Schedule**: Daily at 02:00 UTC.
- **Method**: `pg_dump` via automated GitHub Action or Cloud Scheduler.
- **Retention**: 30 days of daily backups.
- **Storage**: Encrypted S3 bucket or Google Cloud Storage.

## 🔥 Firebase Storage
- **Schedule**: Weekly on Sunday at 03:00 UTC.
- **Method**: `gsutil rsync` to a secondary backup bucket.
- **Retention**: 4 weekly snapshots.

## 🚀 Recovery Procedure
1.  **DB**: Fetch latest `.sql` dump and run `psql -f backup.sql`.
2.  **Files**: Restore from backup bucket using `gsutil cp -r`.

---
*Last Updated: 2026-03-08*

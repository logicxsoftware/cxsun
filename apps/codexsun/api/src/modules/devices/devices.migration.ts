import { sql, type Kysely } from "kysely";
import { runMigrationBatch, type MigrationBatch } from "@cxsun/framework/db";
import type { DevicesDatabase } from "./devices.types.js";
export const devicesMigrationBatch: MigrationBatch<DevicesDatabase> = {
  batch: 1,
  scope: "codexsun.devices",
  version: "1.0.87",
  description: "Personal workspace devices.",
  steps: [
    {
      name: "cxsun.devices.initial",
      version: 1,
      checksum: "cxsun.devices.initial:v1",
      description: "Create owned device presence table.",
      up: async (database) => {
        await sql
          .raw(
            `CREATE TABLE IF NOT EXISTS cxsun_devices (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE,
 device_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 label VARCHAR(120) NOT NULL, kind VARCHAR(24) NOT NULL,
 status VARCHAR(24) NOT NULL DEFAULT 'active', last_seen_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 created_by VARCHAR(191) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY cxsun_device_identity(created_by,device_key), INDEX cxsun_device_actor(created_by,last_seen_at)
 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
          )
          .execute(database);
        await sql
          .raw(
            `CREATE TABLE IF NOT EXISTS cxsun_device_activity (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE,
 device_uuid CHAR(8) NOT NULL, action VARCHAR(24) NOT NULL, actor_email VARCHAR(191) NOT NULL,
 status VARCHAR(24) NOT NULL DEFAULT 'active', created_by VARCHAR(191) NOT NULL DEFAULT 'system:migration',
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(device_uuid) REFERENCES cxsun_devices(uuid),
 INDEX cxsun_device_activity_owner(device_uuid,id)
 ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
          )
          .execute(database);
      }
    },
    {
      name: "cxsun.devices.activity-standard-v2",
      version: 2,
      checksum: "cxsun.devices.activity-standard-v2:v1",
      description: "Add standard audit columns without changing device history.",
      up: async (database) => {
        for (const [column, definition] of [
          ["status", "VARCHAR(24) NOT NULL DEFAULT 'active'"],
          ["created_by", "VARCHAR(191) NOT NULL DEFAULT 'system:migration'"],
          ["updated_at", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"]
        ] as const) {
          const result = await sql<{
            count: number;
          }>`SELECT COUNT(*) count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='cxsun_device_activity' AND COLUMN_NAME=${column}`.execute(
            database
          );
          if (Number(result.rows[0]?.count) === 0)
            await sql
              .raw(`ALTER TABLE cxsun_device_activity ADD COLUMN ${column} ${definition}`)
              .execute(database);
        }
        await sql`UPDATE cxsun_device_activity SET created_by=actor_email WHERE created_by='system:migration'`.execute(
          database
        );
      }
    }
  ]
};
export const migrateDevicesDatabase = (database: Kysely<DevicesDatabase>) =>
  runMigrationBatch(database, devicesMigrationBatch);

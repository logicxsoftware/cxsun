import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import Fastify from "fastify";
import { createPool } from "mysql2";
import { createConnection } from "mysql2/promise";
import { Kysely, MysqlDialect, sql } from "kysely";
import { AppError } from "@cxsun/framework/errors";
import { loadEnv } from "@cxsun/framework/env";
import { z } from "zod";
import { employeeModule } from "./employee.module.js";
import { migrateEmployeeDatabase } from "./employee.migration.js";
import { countEmployeeUserReferences, EmployeeRepository } from "./employee.repository.js";
import { seedEmployeePermissions } from "./employee.seed.js";
import { EmployeeService } from "./employee.service.js";
import type {
  EmployeeDatabase,
  EmployeeInput,
  EmployeePermissionDatabase
} from "./employee.types.js";

const env = loadEnv(
  z.object({
    NODE_ENV: z.literal("development"),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1)
  })
);
assert.equal(env.NODE_ENV, "development", "Employee E2E only runs in development.");
const suffix = randomBytes(5).toString("hex");
const names = [`cxsun_dev_hrms_${suffix}_a`, `cxsun_dev_hrms_${suffix}_b`];
const options = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD
};
const admin = await createConnection(options);
const databases: Kysely<EmployeeDatabase & EmployeePermissionDatabase>[] = [];
const createdNames: string[] = [];
const app = Fastify();
const input: EmployeeInput = {
  employeeCode: "EMP-001",
  name: "Employee test",
  email: "employee@example.test",
  phone: "",
  department: "Support",
  designation: "Executive",
  joiningDate: "2026-10-13",
  userId: 1,
  notes: "Test record",
  status: "active"
};
try {
  for (const name of names) {
    assert.match(name, /^cxsun_dev_hrms_[0-9a-f]{10}_[ab]$/);
    await admin.query(
      `CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    createdNames.push(name);
    const database = open(name);
    databases.push(database);
    await sql
      .raw(
        "CREATE TABLE app_users (id INT NOT NULL PRIMARY KEY,name VARCHAR(180),email VARCHAR(180),status VARCHAR(24))"
      )
      .execute(database);
    await sql
      .raw(
        "INSERT INTO app_users VALUES (1,'Active user','active@example.test','active'),(2,'Inactive user','inactive@example.test','inactive'),(3,'Other user','other@example.test','active')"
      )
      .execute(database);
    await sql
      .raw("CREATE TABLE app_roles (id INT PRIMARY KEY,`key` VARCHAR(80) UNIQUE)")
      .execute(database);
    await sql.raw("INSERT INTO app_roles VALUES (1,'admin')").execute(database);
    await sql
      .raw(
        "CREATE TABLE app_permissions (id INT AUTO_INCREMENT PRIMARY KEY,uuid CHAR(8) UNIQUE,`key` VARCHAR(180) UNIQUE,label VARCHAR(191),description VARCHAR(255),status VARCHAR(24),is_protected BOOLEAN)"
      )
      .execute(database);
    await sql
      .raw(
        "CREATE TABLE app_role_permissions (id INT AUTO_INCREMENT PRIMARY KEY,uuid CHAR(8) UNIQUE,role_id INT,permission_id INT,status VARCHAR(24),is_protected BOOLEAN,UNIQUE(role_id,permission_id))"
      )
      .execute(database);
    await migrateEmployeeDatabase(database);
    await migrateEmployeeDatabase(database);
    await seedEmployeePermissions(database);
    await sql`UPDATE app_permissions SET status='inactive' WHERE \`key\`='hrms.employee.delete'`.execute(
      database
    );
    await sql`UPDATE app_role_permissions SET status='inactive' WHERE permission_id=(SELECT id FROM app_permissions WHERE \`key\`='hrms.employee.update')`.execute(
      database
    );
    await seedEmployeePermissions(database);
    const permissions = await sql<{
      status: string;
    }>`SELECT status FROM app_permissions WHERE \`key\`='hrms.employee.delete'`.execute(database);
    assert.equal(permissions.rows[0]?.status, "inactive");
    const grants = await sql<{
      status: string;
    }>`SELECT status FROM app_role_permissions WHERE permission_id=(SELECT id FROM app_permissions WHERE \`key\`='hrms.employee.update')`.execute(
      database
    );
    assert.equal(grants.rows[0]?.status, "inactive");
    await sql`UPDATE app_permissions SET status='active'`.execute(database);
    await sql`UPDATE app_role_permissions SET status='active'`.execute(database);
  }
  const database = databases[0]!;
  const users = userAdapter(database);
  const service = new EmployeeService(new EmployeeRepository(database), users);
  const created = await service.create(
    { ...input, employeeCode: " emp-001 " },
    "admin@example.test"
  );
  assert.match(created.id, /^[0-9a-f]{8}$/);
  assert.equal(created.employeeCode, "EMP-001");
  assert.equal(created.userName, "Active user");
  assert.equal(created.joiningDate, "2026-10-13");
  await assert.rejects(
    service.create({ ...input, userId: null }, "admin@example.test"),
    /code already exists/
  );
  await assert.rejects(
    service.create({ ...input, employeeCode: "EMP-002" }, "admin@example.test"),
    /already mapped/
  );
  await assert.rejects(
    service.create({ ...input, employeeCode: "EMP-002", userId: 999 }, "admin@example.test"),
    /this tenant/
  );
  await assert.rejects(
    service.create({ ...input, employeeCode: "EMP-002", userId: 2 }, "admin@example.test"),
    /active user/
  );
  await service.create({ ...input, employeeCode: "EMP-002", userId: null }, "admin@example.test");
  await service.create({ ...input, employeeCode: "EMP-003", userId: null }, "admin@example.test");
  assert.equal(await countEmployeeUserReferences(database, 1), 1);
  const other = new EmployeeService(
    new EmployeeRepository(databases[1]!),
    userAdapter(databases[1]!)
  );
  await assert.rejects(other.get(created.id), /not found/);
  await other.create(input, "other@example.test");
  assert.equal((await other.list({})).length, 1);
  const races = await Promise.allSettled(
    ["EMP-RACE-A", "EMP-RACE-B"].map((employeeCode) =>
      service.create({ ...input, employeeCode, userId: 3 }, "admin@example.test")
    )
  );
  assert.equal(races.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(races.filter((result) => result.status === "rejected").length, 1);
  await service.update(created.id, { ...input, name: "Updated employee" }, "admin@example.test");
  await service.setStatus(created.id, "inactive", "admin@example.test");
  assert.equal((await service.get(created.id)).status, "inactive");
  await service.setStatus(created.id, "active", "admin@example.test");
  await service.remove(created.id, "admin@example.test");
  assert.equal((await service.list({ deleted: true })).length, 1);
  await assert.rejects(service.update(created.id, input, "admin@example.test"), /Restore/);
  await assert.rejects(
    service.create({ ...input, userId: null }, "admin@example.test"),
    /code already exists/
  );
  assert.equal(await countEmployeeUserReferences(database, 1), 1);
  await service.restore(created.id, "admin@example.test");
  assert.equal((await service.get(created.id)).status, "inactive");
  await assert.rejects(
    service.forceDelete(created.id, "admin@example.test"),
    /before permanent deletion/
  );

  let authenticated = false;
  let allowed = false;
  await employeeModule.register(app, async () => {
    if (!authenticated) throw AppError.unauthorized("Login required.");
    return {
      database,
      actorEmail: "admin@example.test",
      users,
      authorize: async () => {
        if (!allowed) throw AppError.forbidden("Permission denied.");
      }
    };
  });
  const routes = [
    { method: "GET", url: "/hrms/employees" },
    { method: "GET", url: "/hrms/employees/users" },
    { method: "GET", url: `/hrms/employees/${created.id}` },
    { method: "GET", url: `/hrms/employees/${created.id}/activity` },
    { method: "POST", url: "/hrms/employees", payload: input },
    { method: "PUT", url: `/hrms/employees/${created.id}`, payload: input },
    { method: "POST", url: `/hrms/employees/${created.id}/status`, payload: { status: "active" } },
    { method: "POST", url: `/hrms/employees/${created.id}/restore` },
    { method: "DELETE", url: `/hrms/employees/${created.id}` },
    { method: "DELETE", url: `/hrms/employees/${created.id}/force` }
  ] as const;
  for (const route of routes) assert.equal((await app.inject(route)).statusCode, 401);
  authenticated = true;
  for (const route of routes) assert.equal((await app.inject(route)).statusCode, 403);
  allowed = true;
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/hrms/employees",
        payload: { ...input, employeeCode: "", userId: null }
      })
    ).statusCode,
    400
  );
  const read = await app.inject({ method: "GET", url: `/hrms/employees/${created.id}` });
  assert.equal(read.statusCode, 200, read.body);
  assert.equal(read.json().data.userId, 1);
  await service.remove(created.id, "admin@example.test");
  await service.forceDelete(created.id, "admin@example.test");
  assert.equal(await countEmployeeUserReferences(database, 1), 0);
  assert.ok((await service.activity(created.id)).some((event) => event.action === "force-deleted"));
  const persisted = await service.create(
    { ...input, employeeCode: "EMP-PERSIST" },
    "admin@example.test"
  );
  await database.destroy();
  const reopened = open(names[0]!);
  databases[0] = reopened;
  await migrateEmployeeDatabase(reopened);
  const persistedService = new EmployeeService(
    new EmployeeRepository(reopened),
    userAdapter(reopened)
  );
  assert.equal((await persistedService.get(persisted.id)).employeeCode, "EMP-PERSIST");
  console.log(
    "HRMS live database tests passed: migrations, repeat seeding, user validation, unique mapping races, two-database isolation, API permission gates, lifecycle, retained audit and persistence after reconnect."
  );
} finally {
  await app.close();
  for (const database of databases) await database.destroy();
  for (const name of createdNames) {
    assert.match(name, /^cxsun_dev_hrms_[0-9a-f]{10}_[ab]$/);
    await admin.query(`DROP DATABASE \`${name}\``);
  }
  await admin.end();
}
function open(name: string) {
  return new Kysely<EmployeeDatabase & EmployeePermissionDatabase>({
    dialect: new MysqlDialect({ pool: createPool({ ...options, database: name }) })
  });
}
function userAdapter(database: Kysely<EmployeeDatabase>) {
  return {
    list: async () =>
      (
        await sql<{
          id: number;
          name: string;
          email: string;
          status: string;
        }>`SELECT id,name,email,status FROM app_users ORDER BY name`.execute(database)
      ).rows,
    find: async (id: number) =>
      (
        await sql<{
          id: number;
          name: string;
          email: string;
          status: string;
        }>`SELECT id,name,email,status FROM app_users WHERE id=${id}`.execute(database)
      ).rows[0] ?? null
  };
}

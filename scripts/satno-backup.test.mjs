import assert from "node:assert/strict";
import { mkdtemp, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertSafeOutputRoot,
  backupDirectoryName,
  buildBackupPlan,
  createBackup,
  verifyBackup,
} from "./satno-backup-lib.mjs";

test("plan excludes secrets, storage objects and automated restore", () => {
  const plan = buildBackupPlan();
  assert.equal(plan.restore.automated, false);
  assert.ok(plan.excluded.includes("API keys and JWT secrets"));
  assert.ok(plan.excluded.includes("physical Supabase Storage objects"));
});

test("output root must be explicit, absolute and outside the repository", () => {
  assert.throws(() => assertSafeOutputRoot("", "/repo"));
  assert.throws(() => assertSafeOutputRoot("relative", "/repo"));
  assert.throws(() => assertSafeOutputRoot("/repo/backups", "/repo"));
  assert.equal(
    assertSafeOutputRoot("/var/backups/satno", "/repo"),
    "/var/backups/satno",
  );
});

test("directory names are deterministic UTC timestamps", () => {
  assert.equal(
    backupDirectoryName(new Date("2026-09-28T05:30:45.123Z")),
    "satno-backup-20260928T053045Z",
  );
});

test("create and verify produce a checksummed manifest without credentials", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "satno-backup-test-"));
  const calls = [];
  const runner = async (command, args, env) => {
    calls.push({ command, args, hasDatabaseUrl: Boolean(env.PGDATABASE) });
    if (command === "pg_dump" && args.includes("--version")) {
      return "pg_dump (PostgreSQL) 18.0\n";
    }
    if (command === "pg_dump") {
      const destination = args
        .find((arg) => arg.startsWith("--file="))
        .slice(7);
      await writeFile(destination, "portable archive fixture");
      return "";
    }
    if (command === "pg_restore") return "; archive table of contents\n";
    throw new Error(`Unexpected command: ${command}`);
  };

  const created = await createBackup({
    outputRoot: tempRoot,
    repositoryRoot: "/workspace/repository",
    databaseUrl: "postgresql://secret-user:secret-password@example/db",
    runCommand: runner,
    now: new Date("2026-09-28T05:30:45.123Z"),
    sourceCommit: "a".repeat(40),
  });
  const rawManifest = await readFile(
    path.join(created.backupPath, "manifest.json"),
    "utf8",
  );
  assert.doesNotMatch(rawManifest, /secret-user|secret-password|PGDATABASE/);
  assert.equal(created.manifest.archive.bytes, 24);
  assert.equal(calls[1].hasDatabaseUrl, true);
  assert.equal(
    await readFile(path.join(created.backupPath, "COMPLETE"), "utf8"),
    "2026-09-28T05:30:45.123Z\n",
  );

  const verified = await verifyBackup({
    backupPath: created.backupPath,
    runCommand: runner,
  });
  assert.equal(verified.valid, true);
  assert.equal(verified.storageObjectsIncluded, false);
});

test("verification rejects incomplete backups and unexpected archive paths", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "satno-backup-test-"));
  const runner = async (command, args) => {
    if (command === "pg_dump" && args.includes("--version"))
      return "pg_dump 18";
    if (command === "pg_dump") {
      const destination = args
        .find((arg) => arg.startsWith("--file="))
        .slice(7);
      await writeFile(destination, "archive");
      return "";
    }
    return "; toc";
  };
  const created = await createBackup({
    outputRoot: tempRoot,
    repositoryRoot: "/workspace/repository",
    databaseUrl: "postgresql://example/db",
    runCommand: runner,
  });

  await unlink(path.join(created.backupPath, "COMPLETE"));
  await assert.rejects(
    verifyBackup({ backupPath: created.backupPath, runCommand: runner }),
    /ENOENT/,
  );

  const manifestPath = path.join(created.backupPath, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.archive.file = "../database.dump";
  await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`);
  await writeFile(path.join(created.backupPath, "COMPLETE"), "complete\n");
  await assert.rejects(
    verifyBackup({ backupPath: created.backupPath, runCommand: runner }),
    /Unexpected backup archive path/,
  );
});

test("verification detects archive tampering", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "satno-backup-test-"));
  const runner = async (command, args) => {
    if (command === "pg_dump" && args.includes("--version"))
      return "pg_dump 18";
    if (command === "pg_dump") {
      const destination = args
        .find((arg) => arg.startsWith("--file="))
        .slice(7);
      await writeFile(destination, "original");
      return "";
    }
    return "; toc";
  };
  const created = await createBackup({
    outputRoot: tempRoot,
    repositoryRoot: "/workspace/repository",
    databaseUrl: "postgresql://example/db",
    runCommand: runner,
  });
  await writeFile(path.join(created.backupPath, "database.dump"), "tampered");

  await assert.rejects(
    verifyBackup({ backupPath: created.backupPath, runCommand: runner }),
    /checksum or size/,
  );
});

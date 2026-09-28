import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const BACKUP_FORMAT_VERSION = 1;

export function buildBackupPlan() {
  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    database: {
      format: "PostgreSQL custom archive",
      create: "pg_dump --format=custom --no-owner --no-privileges",
      inspect: "pg_restore --list",
    },
    included: ["database schema", "database rows", "archive table of contents"],
    excluded: [
      "database connection string",
      "API keys and JWT secrets",
      "SMS, email and OAuth provider secrets",
      "physical Supabase Storage objects",
      "DNS, custom domains and platform settings",
    ],
    restore: {
      automated: false,
      requiresExplicitApproval: true,
      destinationMustBeEmptyAndDisposableForFirstDrill: true,
    },
  };
}

export function assertSafeOutputRoot(outputRoot, repositoryRoot) {
  if (!outputRoot) {
    throw new Error(
      "SATNO_BACKUP_OUTPUT_DIR must be an explicit absolute path",
    );
  }

  const resolved = path.resolve(outputRoot);
  if (!path.isAbsolute(outputRoot)) {
    throw new Error("SATNO_BACKUP_OUTPUT_DIR must be absolute");
  }
  if (resolved === path.parse(resolved).root || resolved === os.homedir()) {
    throw new Error("Refusing to use a filesystem root or home directory");
  }

  const repo = path.resolve(repositoryRoot);
  const relativeToRepository = path.relative(repo, resolved);
  if (
    relativeToRepository === "" ||
    (!relativeToRepository.startsWith("..") &&
      !path.isAbsolute(relativeToRepository))
  ) {
    throw new Error("Backups must be stored outside the Git repository");
  }

  return resolved;
}

export function backupDirectoryName(now = new Date()) {
  return `satno-backup-${now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z")}`;
}

export async function sha256File(filePath) {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

export async function createBackup({
  outputRoot,
  repositoryRoot,
  databaseUrl,
  runCommand,
  now = new Date(),
  sourceCommit = null,
}) {
  if (!databaseUrl) {
    throw new Error(
      "PGDATABASE is required and is never written to the backup",
    );
  }

  const safeRoot = assertSafeOutputRoot(outputRoot, repositoryRoot);
  const backupPath = path.join(safeRoot, backupDirectoryName(now));
  await mkdir(safeRoot, { recursive: true, mode: 0o700 });
  await mkdir(backupPath, { recursive: false, mode: 0o700 });

  const archivePath = path.join(backupPath, "database.dump");
  const environment = { ...process.env, PGDATABASE: databaseUrl };
  const version = await runCommand("pg_dump", ["--version"], environment);

  await runCommand(
    "pg_dump",
    [
      "--format=custom",
      "--no-owner",
      "--no-privileges",
      `--file=${archivePath}`,
    ],
    environment,
  );

  const tableOfContents = await runCommand(
    "pg_restore",
    ["--list", archivePath],
    environment,
  );
  await writeFile(path.join(backupPath, "database.toc"), tableOfContents, {
    flag: "wx",
    mode: 0o600,
  });

  const archiveStat = await stat(archivePath);
  const manifest = {
    ...buildBackupPlan(),
    createdAt: now.toISOString(),
    sourceCommit,
    tooling: { pgDump: version.trim() },
    archive: {
      file: "database.dump",
      bytes: archiveStat.size,
      sha256: await sha256File(archivePath),
    },
  };

  await writeFile(
    path.join(backupPath, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { flag: "wx", mode: 0o600 },
  );
  await writeFile(path.join(backupPath, "COMPLETE"), `${now.toISOString()}\n`, {
    flag: "wx",
    mode: 0o600,
  });

  return { backupPath, manifest };
}

export async function verifyBackup({ backupPath, runCommand }) {
  const resolved = path.resolve(backupPath);
  const manifest = JSON.parse(
    await readFile(path.join(resolved, "manifest.json"), "utf8"),
  );
  if (manifest.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error("Unsupported SATNO backup format");
  }
  if (manifest.archive?.file !== "database.dump") {
    throw new Error("Unexpected backup archive path");
  }

  await stat(path.join(resolved, "COMPLETE"));

  const archivePath = path.join(resolved, manifest.archive.file);
  const archiveStat = await stat(archivePath);
  const actualHash = await sha256File(archivePath);
  if (
    archiveStat.size !== manifest.archive.bytes ||
    actualHash !== manifest.archive.sha256
  ) {
    throw new Error("Backup archive checksum or size does not match manifest");
  }

  await runCommand("pg_restore", ["--list", archivePath], process.env);
  return {
    valid: true,
    archive: manifest.archive.file,
    bytes: archiveStat.size,
    sha256: actualHash,
    storageObjectsIncluded: false,
  };
}

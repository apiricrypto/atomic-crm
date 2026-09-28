#!/usr/bin/env node

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import {
  buildBackupPlan,
  createBackup,
  verifyBackup,
} from "./satno-backup-lib.mjs";

const execFileAsync = promisify(execFile);

async function runCommand(command, args, env) {
  const { stdout } = await execFileAsync(command, args, {
    env,
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout;
}

async function readSourceCommit() {
  try {
    return (await runCommand("git", ["rev-parse", "HEAD"], process.env)).trim();
  } catch {
    return null;
  }
}

async function main() {
  const [command = "plan", target] = process.argv.slice(2);
  const repositoryRoot = process.cwd();

  if (command === "plan") {
    process.stdout.write(`${JSON.stringify(buildBackupPlan(), null, 2)}\n`);
    return;
  }

  if (command === "create") {
    const result = await createBackup({
      outputRoot: process.env.SATNO_BACKUP_OUTPUT_DIR,
      repositoryRoot,
      databaseUrl: process.env.PGDATABASE,
      runCommand,
      sourceCommit: await readSourceCommit(),
    });
    process.stdout.write(
      `${JSON.stringify(
        {
          created: true,
          backupPath: result.backupPath,
          archive: result.manifest.archive,
          storageObjectsIncluded: false,
        },
        null,
        2,
      )}\n`,
    );
    return;
  }

  if (command === "verify") {
    if (!target || !path.isAbsolute(target)) {
      throw new Error("verify requires an explicit absolute backup directory");
    }
    process.stdout.write(
      `${JSON.stringify(
        await verifyBackup({ backupPath: target, runCommand }),
        null,
        2,
      )}\n`,
    );
    return;
  }

  if (command === "restore") {
    throw new Error(
      "Restore is intentionally not automated; follow docs/satno/BACKUP_MIGRATION_ACCEPTANCE.md after explicit approval",
    );
  }

  throw new Error("Usage: satno-backup.mjs plan|create|verify <absolute-path>");
}

main().catch((error) => {
  console.error(`SATNO backup failed: ${error.message}`);
  process.exitCode = 1;
});

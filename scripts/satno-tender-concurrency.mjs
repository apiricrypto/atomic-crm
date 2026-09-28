#!/usr/bin/env node

import {
  loadConfiguration,
  loadManifest,
  runConcurrencyMatrix,
} from "./satno-tender-concurrency-lib.mjs";

async function main() {
  const manifestPath = process.argv[2];
  const configuration = loadConfiguration(process.env);
  const manifest = await loadManifest(manifestPath, process.cwd());
  const result = await runConcurrencyMatrix({
    manifest,
    config: configuration,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown failure";
  process.stderr.write(`Tender concurrency acceptance failed: ${message}\n`);
  process.exitCode = 1;
});

#!/usr/bin/env node

import { inspectDisposableReadiness } from "./satno-tender-disposable-readiness-lib.mjs";

const result = inspectDisposableReadiness();
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = result.ready ? 0 : 2;

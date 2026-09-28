import assert from "node:assert/strict";
import test from "node:test";

import {
  inspectDisposableReadiness,
  normalizeArchitecture,
  SUPABASE_POSTGRES_IMAGE,
} from "./satno-tender-disposable-readiness-lib.mjs";

function successful(stdout) {
  return { ok: true, stdout };
}

function commandStub({ server, image, supabase = true, client = true }) {
  return (command, args) => {
    const key = `${command} ${args.slice(0, 2).join(" ")}`;
    if (key === "docker version --format") {
      const payload = args.at(-1).includes("Client")
        ? client && { Version: "test" }
        : server;
      return payload
        ? successful(JSON.stringify(payload))
        : { ok: false, stdout: "" };
    }
    if (key === "docker image inspect") {
      return image
        ? successful(JSON.stringify(image))
        : { ok: false, stdout: "" };
    }
    if (command === "npx") {
      return supabase ? successful("2.50.0\n") : { ok: false, stdout: "" };
    }
    throw new Error("unexpected readiness command");
  };
}

test("normalizes common Docker and Node architecture names", () => {
  assert.equal(normalizeArchitecture("x64"), "amd64");
  assert.equal(normalizeArchitecture("x86_64"), "amd64");
  assert.equal(normalizeArchitecture("aarch64"), "arm64");
  assert.equal(normalizeArchitecture("mips"), null);
});

test("reports a ready local Linux stack without exposing command output", () => {
  const result = inspectDisposableReadiness({
    hostArch: "x64",
    hostPlatform: "win32",
    runCommand: commandStub({
      server: { Os: "linux", Arch: "amd64", Secret: "must-not-leak" },
      image: { Architecture: "amd64", RepoDigests: ["must-not-leak"] },
    }),
  });

  assert.equal(result.ready, true);
  assert.equal(result.scope, "local-disposable-only");
  assert.equal(result.docker.architecture, "amd64");
  assert.equal(result.postgresImage.reference, SUPABASE_POSTGRES_IMAGE);
  assert.doesNotMatch(JSON.stringify(result), /must-not-leak/);
});

test("identifies the architecture mismatch behind an exec-format failure", () => {
  const result = inspectDisposableReadiness({
    hostArch: "x64",
    runCommand: commandStub({
      server: { Os: "linux", Arch: "amd64" },
      image: { Architecture: "arm64" },
    }),
  });

  assert.equal(result.ready, false);
  assert.deepEqual(result.blockers.at(-1), {
    code: "supabase_postgres_image_architecture_mismatch",
    detail: { engine: "amd64", image: "arm64" },
  });
});

test("fails closed when Docker or the existing Supabase CLI is unavailable", () => {
  const result = inspectDisposableReadiness({
    runCommand: commandStub({
      client: false,
      server: null,
      image: null,
      supabase: false,
    }),
  });

  assert.equal(result.ready, false);
  assert.deepEqual(
    result.blockers.map(({ code }) => code),
    [
      "docker_cli_unavailable",
      "docker_engine_unavailable",
      "supabase_cli_unavailable_without_install",
    ],
  );
  assert.deepEqual(
    result.warnings.map(({ code }) => code),
    ["docker_architecture_unknown", "supabase_postgres_image_not_inspectable"],
  );
});

test("requires Docker Desktop to use Linux containers", () => {
  const result = inspectDisposableReadiness({
    runCommand: commandStub({
      server: { Os: "windows", Arch: "amd64" },
      image: { Architecture: "amd64" },
    }),
  });

  assert.equal(result.ready, false);
  assert.ok(
    result.blockers.some(
      ({ code }) => code === "docker_engine_must_use_linux_containers",
    ),
  );
});

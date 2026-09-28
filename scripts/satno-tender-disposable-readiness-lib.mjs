import { spawnSync } from "node:child_process";

export const SUPABASE_POSTGRES_IMAGE =
  "public.ecr.aws/supabase/postgres:15.8.1.085";

const ARCH_ALIASES = new Map([
  ["x64", "amd64"],
  ["x86_64", "amd64"],
  ["amd64", "amd64"],
  ["aarch64", "arm64"],
  ["arm64", "arm64"],
]);

export function normalizeArchitecture(value) {
  if (typeof value !== "string") return null;
  return ARCH_ALIASES.get(value.trim().toLowerCase()) ?? null;
}

export function runReadOnlyCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    windowsHide: true,
    timeout: 15_000,
  });
  return {
    ok: result.status === 0 && result.error === undefined,
    stdout: result.stdout ?? "",
  };
}

function parseJson(result) {
  if (!result.ok) return null;
  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    return null;
  }
}

function add(items, code, detail = null) {
  items.push(detail ? { code, detail } : { code });
}

export function inspectDisposableReadiness({
  runCommand = runReadOnlyCommand,
  hostArch = process.arch,
  hostPlatform = process.platform,
  postgresImage = SUPABASE_POSTGRES_IMAGE,
} = {}) {
  const blockers = [];
  const warnings = [];
  const checks = [];

  const dockerClient = runCommand("docker", [
    "version",
    "--format",
    "{{json .Client}}",
  ]);
  const dockerServer = runCommand("docker", [
    "version",
    "--format",
    "{{json .Server}}",
  ]);
  const client = parseJson(dockerClient);
  const server = parseJson(dockerServer);

  if (!client) add(blockers, "docker_cli_unavailable");
  else add(checks, "docker_cli_available");

  if (!server) {
    add(blockers, "docker_engine_unavailable");
  } else {
    add(checks, "docker_engine_available");
    if (String(server.Os ?? "").toLowerCase() !== "linux") {
      add(blockers, "docker_engine_must_use_linux_containers");
    } else {
      add(checks, "docker_linux_containers");
    }
  }

  const hostArchitecture = normalizeArchitecture(hostArch);
  const engineArchitecture = normalizeArchitecture(server?.Arch);
  if (!hostArchitecture) add(warnings, "host_architecture_unknown");
  if (!engineArchitecture) add(warnings, "docker_architecture_unknown");

  const imageResult = runCommand("docker", [
    "image",
    "inspect",
    "--format",
    "{{json .}}",
    postgresImage,
  ]);
  const image = parseJson(imageResult);
  const imageArchitecture = normalizeArchitecture(image?.Architecture);

  if (!image) {
    add(warnings, "supabase_postgres_image_not_inspectable");
  } else if (!imageArchitecture) {
    add(warnings, "supabase_postgres_image_architecture_unknown");
  } else if (engineArchitecture && imageArchitecture !== engineArchitecture) {
    add(blockers, "supabase_postgres_image_architecture_mismatch", {
      engine: engineArchitecture,
      image: imageArchitecture,
    });
  } else {
    add(checks, "supabase_postgres_image_architecture_matches");
  }

  const supabase = runCommand("npx", ["--no-install", "supabase", "--version"]);
  if (!supabase.ok) add(blockers, "supabase_cli_unavailable_without_install");
  else add(checks, "supabase_cli_available");

  return {
    ready: blockers.length === 0,
    scope: "local-disposable-only",
    host: {
      platform: hostPlatform,
      architecture: hostArchitecture ?? "unknown",
    },
    docker: {
      os: server?.Os ?? "unknown",
      architecture: engineArchitecture ?? "unknown",
    },
    postgresImage: {
      reference: postgresImage,
      architecture: imageArchitecture ?? "unknown",
    },
    checks,
    warnings,
    blockers,
  };
}

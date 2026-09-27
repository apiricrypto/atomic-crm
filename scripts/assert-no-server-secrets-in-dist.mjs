import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const readFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? readFiles(target) : target;
    }),
  );
  return files.flat();
};

const parseEnv = (source) =>
  Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

const localE2eEnv = parseEnv(
  await readFile(path.join(root, ".env.e2e"), "utf8"),
);
const forbiddenValues = [
  process.env.SERVICE_ROLE_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  localE2eEnv.SERVICE_ROLE_KEY,
].filter((value) => value && value.length >= 24);

const forbiddenNames = ["SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const builtFiles = await readFiles(dist);

for (const file of builtFiles) {
  const content = await readFile(file);
  const text = content.toString("utf8");
  const isSourceMap = file.endsWith(".map");
  if (!isSourceMap && forbiddenNames.some((name) => text.includes(name))) {
    throw new Error(
      `Server-only secret name found in browser artifact: ${file}`,
    );
  }
  if (forbiddenValues.some((value) => text.includes(value))) {
    throw new Error(
      `Server-only secret value found in browser artifact: ${file}`,
    );
  }
}

if (builtFiles.length === 0) {
  throw new Error("No browser artifacts found to inspect.");
}

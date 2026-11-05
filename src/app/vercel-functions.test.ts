import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Vercel's Hobby plan deploys at most 12 Serverless Functions. Every
// `api/**/*.ts` file not prefixed with `_` becomes one, so new endpoints should
// go behind an existing `[action]` dispatcher instead of adding a file.
const ROOT = join(__dirname, "../..");
const API = join(ROOT, "api");
const LIMIT = 12;

function functionFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    if (entry.startsWith("_") || entry.startsWith(".")) return [];
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return functionFiles(full);
    return /\.(ts|js|mjs)$/.test(entry) ? [relative(API, full)] : [];
  });
}

const aiActions = readdirSync(API)
  .filter((f) => /^_ai-[a-z0-9-]+\.ts$/.test(f))
  .map((f) => f.slice("_ai-".length, -".ts".length))
  .sort();

describe("Vercel serverless functions", () => {
  it(`stays within the ${LIMIT}-function cap`, () => {
    const files = functionFiles(API);
    expect(files.length, files.join(", ")).toBeLessThanOrEqual(LIMIT);
  });

  it("rewrites every AI action to the ai/[action] dispatcher", () => {
    const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
    const rule = (vercel.rewrites as { source: string; destination: string }[]).find(
      (r) => r.destination === "/api/ai/:action",
    );
    const listed = rule?.source.match(/^\/api\/:action\((.+)\)$/)?.[1].split("|").sort();
    expect(listed).toEqual(aiActions);
  });

  it("dispatches every AI action", () => {
    const dispatcher = readFileSync(join(API, "ai/[action].ts"), "utf8");
    for (const action of aiActions) {
      expect(dispatcher).toContain(`from "../_ai-${action}.js"`);
    }
  });
});

/**
 * Auto-generates styles.css from app/src/app/index.css.
 * Run as part of build — consumers always get styles in sync with the design system.
 *
 * Strategy:
 *   - Inline all relative @imports (colors.css, etc.) into a single file
 *   - Strip imports that must NOT be duplicated in the consumer's project:
 *       @import "tailwindcss"     — consumer already has this
 *       @import "tw-animate-css"  — consumer installs separately if needed
 *       @import "./fonts.css"     — fonts are app-specific, not part of the kit
 *   - Prepend @source "./dist"   — tells consumer's Tailwind to scan the kit bundle
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appSrcDir = resolve(__dirname, "../../../app");
const kitDir = __dirname;

/** Relative imports to skip entirely (not inlined, not emitted) */
const SKIP_RELATIVE_IMPORTS = [
  "./styles/fonts.css", // app-specific fonts — not part of the kit
];

/** Non-relative (npm) imports to strip from output */
const STRIP_NPM_IMPORTS = [
  /@import ["']tailwindcss["'];\n?/g,    // consumer already imports this
  /@import ["']tw-animate-css["'];\n?/g, // consumer installs separately if needed
];

/**
 * Reads a CSS file and inlines all relative @imports recursively.
 * Skips paths listed in SKIP_RELATIVE_IMPORTS.
 * Non-relative imports (npm packages) are left as-is.
 */
function inlineImports(filePath) {
  const dir = dirname(filePath);
  const content = readFileSync(filePath, "utf-8");

  return content.replace(/@import ["'](\.\/[^"']+)["'];\n?/g, (_, relativePath) => {
    if (SKIP_RELATIVE_IMPORTS.includes(relativePath)) return "";
    const importedPath = resolve(dir, relativePath);
    return `/* inlined from ${relativePath} */\n${inlineImports(importedPath)}\n`;
  });
}

let css = inlineImports(resolve(appSrcDir, "index.css"));

// Strip npm imports the consumer should not duplicate
for (const pattern of STRIP_NPM_IMPORTS) {
  css = css.replace(pattern, "");
}

const output = `/* =============================================================================
   @adaptionlabs/ui-kit — Design System Styles
   Auto-generated from app/src/app/index.css. Do not edit manually.

   Import in your project's main CSS after @import "tailwindcss":

     @import "tailwindcss";
     @import "@adaptionlabs/ui-kit/styles.css";
   ============================================================================= */

/* Tell Tailwind to scan the pre-built bundle for class names */
@source ".";

${css.trim()}
`;

writeFileSync(resolve(kitDir, "dist", "styles.css"), output);
console.log("✓ dist/styles.css generated from index.css");

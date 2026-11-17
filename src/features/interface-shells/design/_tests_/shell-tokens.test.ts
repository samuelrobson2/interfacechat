import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PARTS, primitives, resolveToken, SHELL_TOKENS, shellVars, sizeTokens, TOKEN_SIZES, tokenAt, withToken } from "../shell-tokens";

describe("the interface design tokens", () => {
  it("follow references to the scales, including names with dots", () => {
    expect(tokenAt(SHELL_TOKENS, "space.3.5")?.$value).toBe("14px");
    expect(resolveToken(SHELL_TOKENS, "{space.3.5}")).toBe("14px");
    expect(resolveToken(SHELL_TOKENS, "{type.title}")).toBe("22px");
  });

  it("give every size the same tokens, so every part reads the same variables at every size", () => {
    const names = TOKEN_SIZES.map((size) => Object.keys(sizeTokens(SHELL_TOKENS, size)).sort().join(","));
    expect(new Set(names).size).toBe(1);
    for (const part of PARTS) expect(names[0]).toContain(`${part}.`);
  });

  it("resolve every token to a value, with no dangling references", () => {
    for (const size of TOKEN_SIZES) {
      for (const [name, value] of Object.entries(shellVars(SHELL_TOKENS, size))) {
        expect(value, name).not.toMatch(/[{}]/);
      }
    }
  });

  it("turn into CSS variables for the size, and follow an edit to a scale", () => {
    expect(shellVars(SHELL_TOKENS, "large")["--shell-title-padding-x"]).toBe("24px");
    const edited = withToken(SHELL_TOKENS, "space.6", "28px");
    expect(shellVars(edited, "large")["--shell-title-padding-x"]).toBe("28px");
    // Small is the glyph on its tile: no tokens.
    expect(shellVars(SHELL_TOKENS, "small")).toEqual({});
  });

  it("start the title and the detail line on the size's one shared edge", () => {
    const edited = withToken(SHELL_TOKENS, "shell.medium-plus.layout.edge", "20px");
    const vars = shellVars(edited, "medium-plus");
    expect(vars["--shell-title-padding-x"]).toBe("20px");
    expect(vars["--shell-meta-padding-x"]).toBe("20px");
  });

  it("keep the CSS defaults for the colour roles equal to the tokens", () => {
    const css = readFileSync(`${process.cwd()}/src/app/index.css`, "utf8");
    for (const role of primitives(SHELL_TOKENS, "color")) {
      expect(css, role.name).toContain(`--shell-color-${role.name}: ${String(role.value)};`);
      expect(css, role.name).toContain(`--color-shell-${role.name}: var(--shell-color-${role.name});`);
    }
  });
});

import { describe, it, expect } from "vitest";
import { areRequiredRolesFilled } from "../are-required-roles-filled";

const roles = [
  { key: "prompt" },
  { key: "completion" },
  { key: "reasoning_trace", optional: true },
];

describe("areRequiredRolesFilled", () => {
  it("is true when every required role is filled (optional role empty)", () => {
    expect(
      areRequiredRolesFilled(roles, {
        prompt: "enhanced_prompt",
        completion: "enhanced_completion",
        reasoning_trace: null,
      }),
    ).toBe(true);
  });

  it("is false when a required role is empty", () => {
    expect(
      areRequiredRolesFilled(roles, {
        prompt: "enhanced_prompt",
        completion: null,
        reasoning_trace: "reasoning_trace",
      }),
    ).toBe(false);
  });

  it("does not require the optional reasoning role to be filled", () => {
    expect(
      areRequiredRolesFilled(roles, {
        prompt: "enhanced_prompt",
        completion: "enhanced_completion",
      }),
    ).toBe(true);
  });

  it("treats roles with no optional flag as required", () => {
    expect(areRequiredRolesFilled([{ key: "prompt" }], {})).toBe(false);
  });
});

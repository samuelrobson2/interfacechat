/**
 * Resolve the initial role→column selections for the wizard's column-role
 * buttons. A saved user selection wins; otherwise fall back to the backend's
 * inferred mapping so the buttons are pre-populated on first visit instead of
 * showing empty until the user re-selects. Roles with neither are left out.
 */
export function buildSavedRoleSelections(
  roles: { key: string }[],
  savedMap: Record<string, string | null | undefined>,
  inferredMapping: Record<string, string | string[] | null | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const role of roles) {
    const saved = savedMap[role.key];
    const inferred = inferredMapping[role.key];
    const val = saved ?? (typeof inferred === "string" ? inferred : null);
    if (val) out[role.key] = val;
  }
  return out;
}

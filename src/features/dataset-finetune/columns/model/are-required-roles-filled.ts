/**
 * Whether every *required* training role has a column assigned. Optional roles
 * (e.g. reasoning_trace — training without reasoning is valid) must not block
 * the wizard's "continue" gate, so they're excluded from the check. A role with
 * no `optional` flag is treated as required.
 */
export function areRequiredRolesFilled(
  roles: { key: string; optional?: boolean }[],
  selections: Record<string, string | null>,
): boolean {
  return roles
    .filter((role) => !role.optional)
    .every((role) => Boolean(selections[role.key]));
}

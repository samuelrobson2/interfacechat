/**
 * Which of several same-kind interfaces this is, as a small count on the
 * corner of its app icon, like an iOS badge, in blue.
 */
export function OrdinalBadge({ value }: { value: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-blue-4 px-1 font-bureau text-[9px] leading-none font-medium text-white ring-2 ring-background-primary"
    >
      {value}
    </span>
  );
}

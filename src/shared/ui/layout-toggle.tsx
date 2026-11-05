import { cn } from "@/shared/lib/css";

/** Small fixed control (bottom-right) to switch between layout variants. */
export function LayoutToggle<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-[2px] rounded-[32px] bg-background-primary p-1",
        "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:32px] [--hairline-opacity:0.2]",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-[60px] px-3 py-1.5 text-typography-secondary transition-colors",
            value === option.value && "bg-gray-6 text-typography-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

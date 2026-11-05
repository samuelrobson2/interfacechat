import { useMemo, useState } from "react";
import { SearchIcon } from "@/shared/assets/icons/general/Search";
import { debounce } from "@/shared/lib/js";
import { Input } from "@/shared/ui/kit/input";
import { cn } from "@/shared/lib/css";

const SEARCH_DEBOUNCE_MS = 300;

export function ChatFolderSearch({
  onSearch,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  onSearch: (query: string) => void;
}) {
  const [value, setValue] = useState("");

  const debouncedSearch = useMemo(
    () => debounce(onSearch, SEARCH_DEBOUNCE_MS),
    [onSearch],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setValue(next);
    debouncedSearch(next.trim());
  };

  return (
    <Input
      variant="plain"
      fill="outlined"
      shape="rounded"
      value={value}
      onChange={handleChange}
      placeholder="Search chats"
      aria-label="Search chats"
      wrapperClassName="w-[200px]"
      className={cn(
        "h-10 bg-background-primary border-none [--hairline-color:var(--color-gray-2)] [--hairline-scale:0.5]",
        className,
      )}
      rightElement={
        <SearchIcon
          svgClasses="size-4 shrink-0"
          pathClasses="stroke-icon-secondary"
        />
      }
      {...props}
    />
  );
}

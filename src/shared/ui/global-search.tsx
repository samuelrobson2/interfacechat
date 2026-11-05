import { cn } from "@/shared/lib/css";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/kit/command";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export interface GlobalSearchItem {
  id: string;
  label: string;
  /** Section heading the item is filed under (e.g. "Chats", "Interfaces"). */
  group: string;
  /** Where selecting the item navigates. */
  to: string;
  /** Leading glyph (lucide icon or <img>). */
  icon?: ReactNode;
}

/** Group items by their `group`, preserving first-seen order. */
function groupItems(items: GlobalSearchItem[]): [string, GlobalSearchItem[]][] {
  const order: string[] = [];
  const map = new Map<string, GlobalSearchItem[]>();
  for (const item of items) {
    if (!map.has(item.group)) {
      map.set(item.group, []);
      order.push(item.group);
    }
    map.get(item.group)!.push(item);
  }
  return order.map((g) => [g, map.get(g)!]);
}

/**
 * Global search: a small icon button that opens a centred, adaption-style
 * command palette in the middle of the screen (also ⌘K / Ctrl-K). Filters
 * across everything you can jump to — chats, interfaces, data and models — and
 * navigates on select.
 */
export function GlobalSearch({
  items,
  className,
  full = false,
}: {
  items: GlobalSearchItem[];
  className?: string;
  /** Render a full-width search bar (icon + "Search" label) instead of a bare icon. */
  full?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const groups = useMemo(() => groupItems(items), [items]);

  // ⌘K / Ctrl-K opens the palette from anywhere in the workspace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      {full ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-full bg-gray-6 px-3 py-2 text-left text-gray-3",
            "transition-colors hover:text-typography-secondary",
            className,
          )}
        >
          <Search className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate font-bureau text-[14px] font-light">
            Search
          </span>
          <kbd className="shrink-0 rounded-[6px] bg-background-primary px-1.5 py-0.5 font-bureau text-[11px] text-gray-3 shadow-[var(--shadow-border)]">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full text-gray-3",
            "transition-colors hover:bg-gray-6 hover:text-typography-secondary",
            className,
          )}
        >
          <Search className="size-4" />
        </button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search chats, interfaces, data and models"
        // STK Bureau for everything inside (headings don't use textVariants),
        // and a snappy pop-in.
        className="font-bureau duration-75"
      >
        <CommandInput placeholder="Search chats, interfaces, data & models…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map(([heading, groupItemsList]) => (
            <CommandGroup key={heading} heading={heading}>
              {groupItemsList.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.label}
                  onSelect={() => go(item.to)}
                >
                  {item.icon}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

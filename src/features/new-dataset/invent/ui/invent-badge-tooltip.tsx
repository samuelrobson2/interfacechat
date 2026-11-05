import { Badge } from "@/shared/ui/kit/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/kit/command";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";

export function InventBadgeTooltip({
  options,
  renderOption,
  onRemove,
  ...props
}: React.ComponentProps<typeof Badge> & {
  options: string[];
  onRemove: (option: string) => void;
  renderOption: (option: string) => React.ReactNode;
}) {
  if (options.length === 0) {
    return null;
  }

  if (options.length === 1) {
    return (
      <Badge onClose={() => onRemove(options[0]!)} {...props}>
        {renderOption(options[0]!)}
      </Badge>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge onClose={() => onRemove(options[0]!)} {...props}>
          {renderOption(options[0]!)} (+{options.length - 1})
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col gap-2">
        <Command>
          <CommandGroup>
            <CommandList>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  closable
                  onClose={() => onRemove(option)}
                >
                  {renderOption(option)}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </TooltipContent>
    </Tooltip>
  );
}

import { Command, CommandInput, CommandList } from "@/shared/ui/kit/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/kit/popover";
import { cn } from "../lib/css";

type CommandFilter = (
  value: string,
  search: string,
  keywords?: string[],
) => number;

export function PopupButton({
  trigger,
  children,
  contentProps,
  commandProps,
  search = true,
  ...props
}: React.ComponentProps<typeof Popover> & {
  trigger: React.ReactNode;
  contentProps?: React.ComponentProps<typeof PopoverContent>;
  commandProps?: React.ComponentProps<typeof Command> & {
    filter?: CommandFilter;
  };
  search?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        {...contentProps}
        className={cn("max-h-[282px]", contentProps?.className)}
      >
        <Command
          {...commandProps}
          className={cn("gap-2 min-h-0", commandProps?.className)}
        >
          {search && <CommandInput />}
          <CommandList>{children}</CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { Button } from "@/shared/ui/kit/button";
import { Command, CommandEmpty, CommandGroup } from "@/shared/ui/kit/command";
import { PopupButton } from "@/shared/ui/popup-button";

type CommandFilter = (
  value: string,
  search: string,
  keywords?: string[],
) => number;

export function DatasetAddButton({
  className,
  isLoading,
  buttonText,
  noOptionsText,
  commandProps,
  children,
}: {
  className?: string;
  isLoading?: boolean;
  buttonText?: string;
  noOptionsText?: string;
  commandProps?: React.ComponentProps<typeof Command> & {
    filter?: CommandFilter;
  };
  children: React.ReactNode;
}) {
  return (
    <PopupButton
      contentProps={{
        side: "right",
        className: "flex flex-col",
      }}
      trigger={
        <Button variant="link" className={className}>
          <PlusSmallIcon pathClasses="stroke-current" />{" "}
          {buttonText || "Add tag"}
        </Button>
      }
      commandProps={commandProps}
    >
      <CommandEmpty>{noOptionsText || "No tags found."}</CommandEmpty>
      <CommandGroup isLoading={isLoading}>{children}</CommandGroup>
    </PopupButton>
  );
}

import { cn } from "@/shared/lib/css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { Text } from "@/shared/ui/kit/text";

export function DatasetsPaginationLayout({
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className="flex items-center justify-between py-3 md:py-6"
      {...props}
    />
  );
}

type Option = {
  label: string;
  value: string;
};

function PaginationSelect({
  options,
  className,
  ...props
}: React.ComponentProps<typeof Select> & {
  options: Option[];
  className?: string;
}) {
  return (
    <Select {...props}>
      <SelectTrigger className={cn("w-fit", className)} size="sm" variant="outline">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function DatasetsPaginationPerPage({
  pageSize,
  className,
  onPageSizeChange,
  options,
  ...props
}: React.ComponentProps<typeof Select> & {
  pageSize: number;
  onPageSizeChange: (pageSize: string) => void;
  className?: string;
  options: Option[];
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <PaginationSelect
        className="border-none"
        value={pageSize.toString()}
        onValueChange={onPageSizeChange}
        options={options}
        {...props}
      />

      <Text variant="body" color="secondary">
        per page
      </Text>
    </div>
  );
}

export function DatasetsPaginationPage({
  currentPage,
  className,
  onCurrentPageChange,
  options,
  totalPages,
  navigationButtons,
  ...props
}: React.ComponentProps<typeof Select> & {
  currentPage: number;
  onCurrentPageChange: (currentPage: string) => void;
  className?: string;
  options: Option[];
  totalPages: number;
  navigationButtons?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Text color="secondary">page</Text>

      <PaginationSelect
        value={currentPage.toString()}
        onValueChange={onCurrentPageChange}
        options={options}
        {...props}
      />

      <Text color="secondary">of {totalPages}</Text>

      <div className="flex items-center gap-1">{navigationButtons}</div>
    </div>
  );
}

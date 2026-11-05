import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function InfoViewLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-14 items-center mx-auto h-screen justify-center px-[16px]",
        className,
      )}
      {...props}
    />
  );
}

export function InfoViewContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-10 items-center", className)}
      {...props}
    />
  );
}

export function InfoViewTitle({
  className,
  title,
  titleClassName,
  descriptionClassName,
  description,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  description?: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex flex-col gap-4 text-center", className)}
      {...props}
    >
      <Text variant="h1" className={titleClassName}>
        {title}
      </Text>
      <Text color="secondary" className={descriptionClassName}>
        {description}
      </Text>
    </div>
  );
}

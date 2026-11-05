import { CheckIcon } from "@/shared/assets/icons/outlined/Check";
import { DotIcon } from "@/shared/assets/icons/outlined/Dot";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function PasswordStrengthChecker({
  passwordRequirements,
  failedRequirements,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  passwordRequirements: Record<string, string>;
  failedRequirements: Set<string>;
}) {
  return (
    <div
      className={cn(
        "bg-background-blue rounded-[12px] p-6 flex flex-col gap-3 border border-blue-2",
        className,
      )}
      {...props}
    >
      <Text variant="title">Your password must contain:</Text>

      <div className="flex flex-col gap-2">
        {Object.entries(passwordRequirements).map(([key, requirement]) => {
          const isMet = !failedRequirements.has(requirement);

          return (
            <Text key={key} className="flex gap-2 items-center">
              <span className="size-4 grid place-items-center">
                {isMet ? (
                  <CheckIcon pathClasses="stroke-icon-primary" />
                ) : (
                  <DotIcon pathClasses="fill-icon-primary" />
                )}
              </span>
              {requirement}
            </Text>
          );
        })}
      </div>
    </div>
  );
}

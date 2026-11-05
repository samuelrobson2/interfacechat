import { useState } from "react";
import { Input, type InputProps } from "@/shared/ui/kit/input";
import { EyeIcon } from "@/shared/assets/icons/general/Eye";
import { EyeSlashIcon } from "@/shared/assets/icons/general/EyeSlash";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { Text } from "@/shared/ui/kit/text";

export function PasswordInput({
  ...props
}: Omit<InputProps, "type" | "rightElement">) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const PasswordIcon = isPasswordVisible ? EyeSlashIcon : EyeIcon;

  const rightIcon = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleTogglePasswordVisibility}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleTogglePasswordVisibility();
            }
          }}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          className="size-10 grid place-items-center cursor-pointer rounded-full hover:bg-background-primary transition-colors"
        >
          <PasswordIcon pathClasses="fill-icon-primary" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <Text>{isPasswordVisible ? "Hide password" : "Show password"}</Text>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <Input
      {...props}
      type={isPasswordVisible ? "text" : "password"}
      rightElement={rightIcon}
    />
  );
}

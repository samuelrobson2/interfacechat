import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/shared/lib/css";
import { textVariants } from "../text";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-[60px]",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  userName,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  userName?: string | null;
}) {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        textVariants({ variant: "body", color: "inverse" }),
        "bg-gradient-black-blue flex size-full items-center justify-center rounded-[60px]",
        className,
      )}
      {...props}
    >
      {userName ? getInitial(userName) : children}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback };

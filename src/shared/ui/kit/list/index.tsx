import * as React from "react";

import { cn } from "@/shared/lib/css";
import { CheckmarkIcon } from "../../../assets/icons/outlined/Checkmark";
import { textVariants } from "../text";

type ListType = "dot" | "number" | "line" | "check";

const ListContext = React.createContext<{ type: ListType }>({ type: "dot" });

interface ListProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "type"> {
  type?: ListType;
}

function List({ className, type = "dot", children, ...props }: ListProps) {
  const sharedClassName = cn(
    "flex flex-col gap-1",
    type === "number" && "[counter-reset:list-item]",
    className,
  );

  const sharedProps = {
    "data-slot": "list",
    "data-type": type,
    className: sharedClassName,
    ...props,
  };

  return (
    <ListContext value={{ type }}>
      {type === "number" ? (
        <ol {...sharedProps}>{children}</ol>
      ) : (
        <ul {...sharedProps}>{children}</ul>
      )}
    </ListContext>
  );
}

interface ListItemProps extends React.ComponentProps<"li"> {
  type?: ListType;
}

function ListItem({
  className,
  type: typeProp,
  children,
  ...props
}: ListItemProps) {
  const ctx = React.useContext(ListContext);
  const type = typeProp ?? ctx.type;

  return (
    <li
      data-slot="list-item"
      data-type={type}
      className={cn(
        textVariants({ variant: "body", color: "primary" }),
        "flex items-center gap-1",
        type === "number" &&
          "[counter-increment:list-item] before:content-[counter(list-item)_'.'] before:shrink-0",
        className,
      )}
      {...props}
    >
      {type !== "number" && <ListItemMarker type={type} />}
      {children}
    </li>
  );
}

function ListItemMarker({ type }: { type: ListType }) {
  switch (type) {
    case "dot":
      return (
        <span
          aria-hidden
          className="size-1 shrink-0 rounded-full bg-blue-5"
        />
      );
    case "line":
      return (
        <span
          aria-hidden
          className="h-0.5 w-1.5 shrink-0 bg-blue-5 rounded-[4px]"
        />
      );
    case "check":
      return (
        <CheckmarkIcon
          aria-hidden
          className="size-2 shrink-0"
          pathClasses="stroke-blue-5"
        />
      );
    default:
      return null;
  }
}

export { List, ListItem };
export type { ListProps, ListItemProps, ListType };

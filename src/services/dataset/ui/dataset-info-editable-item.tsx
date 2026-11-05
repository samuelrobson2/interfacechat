import { PencilEditIcon } from "@/shared/assets/icons/general/PencilEdit";
import { cn } from "@/shared/lib/css";
import { ExpandedText } from "@/shared/ui/kit/expanded-text";
import { Input } from "@/shared/ui/kit/input";
import { Text } from "@/shared/ui/kit/text";
import { Textarea } from "@/shared/ui/kit/textarea";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

type FormData = Record<string, string>;

export function DatasetInfoEditableItem({
  value,
  onSubmit,
  title,
  label,
  name,
  className,
  inputType = "input",
  maxTextLines = 1,
  disabled = false,
  expanded = false,
  placeholder,
  autoSave = false,
  autoSaveDebounceMs = 700,
}: {
  value: string;
  onSubmit: (value: string) => void;
  title?: string;
  label?: string;
  name: string;
  disabled?: boolean;
  maxTextLines?: number;
  inputType?: "input" | "textarea";
  className?: string;
  expanded?: boolean;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveDebounceMs?: number;
}) {
  const [isEditing, setIsEditing] = useState<boolean>(expanded);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      [name]: value,
    },
  });

  useEffect(() => {
    setValue(name, value ?? "");
  }, [name, setValue, value]);

  const handleSave = (data: FormData) => {
    const nextValue = data[name] ?? "";
    if (nextValue !== (value ?? "")) {
      onSubmitRef.current(nextValue);
    }
    if (!autoSave) setIsEditing(false);
  };

  const fieldError = errors[name as keyof FormData];
  const watchedValue = watch(name);

  const InputComponent = inputType === "input" ? Input : Textarea;

  useEffect(() => {
    if (!autoSave || !isEditing) return;

    const nextValue = watchedValue ?? "";

    const timeoutId = window.setTimeout(() => {
      if (nextValue === (value ?? "")) return;
      onSubmitRef.current(nextValue);
    }, autoSaveDebounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoSave, autoSaveDebounceMs, isEditing, value, watchedValue]);

  const content = isEditing ? (
    <form onSubmit={handleSubmit(handleSave)}>
      <InputComponent
        autoFocus
        fill="underline"
        className={cn(["w-full p-0 pb-2 h-auto items-start gap-3"])}
        maxRows={maxTextLines}
        inputClassName="p-0 m-0"
        placeholder={placeholder}
        error={fieldError?.message}
        {...register(name, {
          validate: (v) => {
            if ((v ?? "").trim().length > 0) return true;
            return label ? `${label} is required` : "This field is required";
          },
        })}
        rightElement={
          !autoSave && (
            <button type="submit">
              <Text className="cursor-pointer">Save</Text>
            </button>
          )
        }
      />
    </form>
  ) : (
    <div className="flex gap-5">
      <ExpandedText maxLines={maxTextLines}>{value}</ExpandedText>
      <PencilEditIcon
        className={cn("cursor-pointer shrink-0", disabled && "opacity-50")}
        pathClasses="stroke-icon-primary"
        onClick={() => !disabled && setIsEditing(true)}
      />
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {title && (
        <Text variant="label" color="secondary">
          {title}
        </Text>
      )}
      {content}
    </div>
  );
}

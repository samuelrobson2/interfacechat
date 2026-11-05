import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import { PencilEditIcon } from "@/shared/assets/icons/general/PencilEdit";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";

export function ConfirmRequestBlock({
  launchBodyText,
  isEditMode,
  hasInvalidJson,
  validationErrors,
  isSaving,
  onCopy,
  onToggleEdit,
  onEnterEdit,
  onChange,
}: {
  launchBodyText: string;
  isEditMode: boolean;
  hasInvalidJson: boolean;
  validationErrors: Record<string, string[]>;
  isSaving?: boolean;
  onCopy: () => void;
  onToggleEdit: () => void;
  onEnterEdit: () => void;
  onChange: (value: string) => void;
}) {
  const validationErrorEntries = Object.entries(validationErrors);
  const hasValidationErrors = validationErrorEntries.length > 0;
  const hasError = hasInvalidJson || hasValidationErrors;
  const editorBorderClass = hasError
    ? "border-red-5 focus:border-red-5"
    : "border-stroke-secondary focus:border-stroke-primary";

  return (
    <div className="w-full min-h-0 flex-1 rounded-[8px] border-[0.5px] border-stroke-secondary p-6 flex flex-col bg-background-primary">
      <div className="mb-4 flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onCopy}
          aria-label="Copy request"
          className="border-[0.5px]"
        >
          <CopyIcon />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="40"
          onClick={onToggleEdit}
          disabled={isSaving || (isEditMode && hasError)}
          className="border-[0.5px]"
        >
          <PencilEditIcon />
          {isEditMode ? (isSaving ? "Saving…" : "Done") : "Edit"}
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        {isEditMode ? (
          <textarea
            aria-invalid={hasError || undefined}
            className={`h-full min-h-[320px] w-full resize-none overflow-auto rounded-[8px] border p-4 font-mono text-sm leading-7 outline-none ${editorBorderClass}`}
            value={launchBodyText}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <pre
            className="h-full min-h-[320px] cursor-text overflow-auto rounded-[8px] p-4 font-mono text-sm leading-7 whitespace-pre-wrap break-words"
            role="button"
            tabIndex={0}
            aria-label="Edit launch JSON"
            onClick={onEnterEdit}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onEnterEdit();
            }}
          >
            {launchBodyText}
          </pre>
        )}
      </div>

      {hasInvalidJson ? (
        <Text color="error" className="mt-3">
          Invalid JSON. Fix it before launch.
        </Text>
      ) : null}

      {!hasInvalidJson && hasValidationErrors ? (
        <ul className="mt-3 flex flex-col gap-1">
          {validationErrorEntries.map(([field, messages]) => (
            <li key={field}>
              <Text color="error" variant="label">
                <span className="font-mono">{field}</span>:{" "}
                {messages.join("; ")}
              </Text>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

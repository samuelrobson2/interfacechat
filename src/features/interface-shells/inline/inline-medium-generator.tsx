import { Check } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { ASPECT_CLASS } from "../model/generator";
import type { GeneratorShellData } from "../model/shell-types";
import { INLINE_TEXT } from "./inline-styles";

/**
 * Generator inline: the prompt's references, then the three variations side by
 * side. Clicking one chooses it, the same as in the window.
 */
export function GeneratorInline({ data, onChange }: { data: GeneratorShellData; onChange?: (data: GeneratorShellData) => void }) {
  const variations = data.variations.slice(0, 3);
  const choose = onChange && ((id: string) => onChange({ ...data, chosen: data.chosen === id ? undefined : id }));
  return (
    <div className="grid grid-cols-3 items-start gap-2">
      {(variations.length ? variations : [null, null, null]).map((variation, index) => {
        if (!variation)
          return (
            <span
              key={index}
              aria-hidden
              className={cn("rounded-[10px] bg-gray-6", data.mode === "image" ? ASPECT_CLASS[data.controls.aspect] : "h-20")}
            />
          );
        const chosen = data.chosen === variation.id;
        return (
          <button
            key={variation.id}
            type="button"
            aria-pressed={chosen}
            aria-label={`Variation ${index + 1}${chosen ? ", chosen" : ""}`}
            disabled={!choose}
            onClick={(event) => {
              event.stopPropagation();
              choose?.(variation.id);
            }}
            className={cn(
              "relative min-w-0 rounded-[10px] text-left transition-shadow",
              chosen ? "ring-2 ring-blue-4 ring-offset-2" : "enabled:hover:ring-1 enabled:hover:ring-gray-3/40 enabled:hover:ring-offset-2",
            )}
          >
            {variation.src ? (
              <img src={variation.src} alt="" className={cn("w-full rounded-[10px] bg-gray-6 object-cover", ASPECT_CLASS[data.controls.aspect])} />
            ) : (
              <span className={cn(INLINE_TEXT, "line-clamp-5 block rounded-[10px] bg-gray-6 px-2.5 py-2 text-[13px]")}>{variation.text}</span>
            )}
            {chosen && (
              <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-blue-4 text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

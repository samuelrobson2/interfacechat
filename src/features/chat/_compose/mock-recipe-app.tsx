import { useEffect, useState } from "react";

import { CheckIcon } from "@/shared/assets/icons/outlined/Check";
import { ChevronLeftIcon } from "@/shared/assets/icons/outlined/ChevronLeft";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { MinusSmallIcon } from "@/shared/assets/icons/outlined/MinusSmall";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// DEV-ONLY mock interactive "mini app" — small enough to live inline in the
// chat rather than in the side panel. A scalable recipe card: adjust servings,
// tick off ingredients, and step through the method.

const BASE_SERVINGS = 2;
const MIN_SERVINGS = 1;
const MAX_SERVINGS = 12;

type Ingredient = { name: string; qty: number | null; unit: string };

// Quantities are given per BASE_SERVINGS servings and scaled from there.
const INGREDIENTS: Ingredient[] = [
  { name: "Salmon fillets", qty: 2, unit: "" },
  { name: "Unsalted butter", qty: 30, unit: "g" },
  { name: "Garlic", qty: 3, unit: "cloves" },
  { name: "Lemon", qty: 0.5, unit: "" },
  { name: "Fresh parsley", qty: 2, unit: "tbsp" },
  { name: "Olive oil", qty: 1, unit: "tbsp" },
  { name: "Salt & pepper", qty: null, unit: "to taste" },
];

type Step = { text: string; seconds?: number };

const STEPS: Step[] = [
  { text: "Pat the salmon dry and season both sides with salt and pepper." },
  {
    text: "Melt the butter with the olive oil in a skillet over medium-high heat.",
  },
  {
    text: "Add the minced garlic and cook for 30 seconds, until fragrant.",
    seconds: 30,
  },
  {
    text: "Sear the salmon skin-side up for 4 minutes, then flip and cook 3 more.",
    seconds: 240,
  },
  {
    text: "Spoon the garlic butter over the fillets, finish with lemon and parsley.",
  },
];

const FRACTIONS: Record<string, string> = {
  "0.25": "¼",
  "0.5": "½",
  "0.75": "¾",
};

function formatQty(qty: number) {
  const rounded = Math.round(qty * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 100) / 100;
  const sym = FRACTIONS[String(frac)];
  if (sym) return whole ? `${whole}${sym}` : sym;
  return String(rounded);
}

function ServingsStepper({
  servings,
  onChange,
}: {
  servings: number;
  onChange: (next: number) => void;
}) {
  const button =
    "grid size-7 place-items-center rounded-full bg-gray-2 text-icon-primary transition-colors hover:bg-gray-3 disabled:opacity-40 disabled:hover:bg-gray-2 cursor-pointer disabled:cursor-not-allowed";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={button}
        aria-label="Fewer servings"
        disabled={servings <= MIN_SERVINGS}
        onClick={() => onChange(servings - 1)}
      >
        <MinusSmallIcon svgClasses="size-4" />
      </button>
      <Text variant="label" className="w-16 text-center">
        {servings} {servings === 1 ? "serving" : "servings"}
      </Text>
      <button
        type="button"
        className={button}
        aria-label="More servings"
        disabled={servings >= MAX_SERVINGS}
        onClick={() => onChange(servings + 1)}
      >
        <PlusSmallIcon svgClasses="size-4" />
      </button>
    </div>
  );
}

// A small countdown for steps that mention a duration. Resets per step because
// the parent gives it a `key`, so each step starts fresh.
function StepTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [started, setStarted] = useState(false);
  const done = remaining === 0;
  // Reaching zero stops the timer without needing a state update of its own.
  const running = started && !done;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => setRemaining((r) => Math.max(0, r - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [running]);

  const label = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  const handleClick = () => {
    if (done) {
      setRemaining(seconds);
      setStarted(true);
    } else {
      setStarted(!running);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-fit items-center gap-2 rounded-full px-2.5 py-1 transition-colors cursor-pointer",
        running ? "bg-blue-1 text-blue-5" : "bg-gray-2 text-typography-primary",
      )}
    >
      <span aria-hidden>⏱</span>
      <Text variant="caption" className="tabular-nums" color="none">
        {label}
      </Text>
      <Text variant="caption" color="secondary">
        {done ? "Restart" : running ? "Pause" : "Start timer"}
      </Text>
    </button>
  );
}

export function RecipeApp({ className }: { className?: string }) {
  const [servings, setServings] = useState(BASE_SERVINGS);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState(0);
  const currentStep = STEPS[step];

  const toggle = (index: number) =>
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[440px] flex-col overflow-hidden rounded-[16px] bg-white",
        "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.4]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-gray-2 p-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-gray-2 text-2xl">
          <span aria-hidden>🐟</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text variant="label">Garlic Butter Salmon</Text>
          <Text variant="caption" color="secondary">
            ⏱ 25 min · Easy
          </Text>
        </div>
      </div>

      {/* Servings */}
      <div className="flex items-center justify-between px-4 py-3">
        <Text variant="caption" color="secondary">
          Servings
        </Text>
        <ServingsStepper servings={servings} onChange={setServings} />
      </div>

      {/* Ingredients */}
      <div className="flex flex-col gap-2 border-t border-gray-2 px-4 py-3">
        <Text variant="caption" color="secondary">
          Ingredients
        </Text>
        <ul className="flex flex-col">
          {INGREDIENTS.map((ingredient, index) => {
            const isChecked = Boolean(checked[index]);
            const amount =
              ingredient.qty === null
                ? ingredient.unit
                : `${formatQty(
                    (ingredient.qty * servings) / BASE_SERVINGS,
                  )}${ingredient.unit ? ` ${ingredient.unit}` : ""}`;
            return (
              <li key={ingredient.name}>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center gap-2.5 py-1.5 text-left"
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors",
                      isChecked
                        ? "border-transparent bg-blue-5 text-icon-inverse"
                        : "border-stroke-secondary",
                    )}
                  >
                    {isChecked && (
                      <CheckIcon svgClasses="size-3" pathClasses="stroke-white" />
                    )}
                  </span>
                  <Text
                    variant="label"
                    className={cn(
                      "flex-1",
                      isChecked && "text-typography-secondary line-through",
                    )}
                  >
                    {ingredient.name}
                  </Text>
                  <Text variant="label" color="secondary">
                    {amount}
                  </Text>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Method */}
      <div className="flex flex-col gap-3 border-t border-gray-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <Text variant="caption" color="secondary">
            Step {step + 1} of {STEPS.length}
          </Text>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous step"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="grid size-7 place-items-center rounded-full bg-gray-2 text-icon-primary transition-colors hover:bg-gray-3 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon svgClasses="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next step"
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="grid size-7 place-items-center rounded-full bg-gray-2 text-icon-primary transition-colors hover:bg-gray-3 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRightIcon svgClasses="size-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 rounded-[12px] bg-gray-1 p-3">
          <div className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-5 text-icon-inverse">
              <Text variant="caption" color="inverse">
                {step + 1}
              </Text>
            </span>
            <Text variant="label" className="flex-1">
              {currentStep?.text}
            </Text>
          </div>
          {currentStep?.seconds !== undefined && (
            <div className="pl-9">
              <StepTimer key={step} seconds={currentStep.seconds} />
            </div>
          )}
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to step ${index + 1}`}
              onClick={() => setStep(index)}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors cursor-pointer",
                index <= step ? "bg-blue-5" : "bg-gray-2",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { ArrowDownIcon } from "@/shared/assets/icons/outlined/ArrowDown";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// DEV-ONLY mock "recipe" answer used to develop the rich chat-thread layouts.

const RECIPE_IMAGES = [
  { emoji: "🍲", label: "Batch cooking" },
  { emoji: "🍗", label: "Sheet pan" },
  { emoji: "🥘", label: "Slow cooker" },
  { emoji: "🍳", label: "Pressure cooker" },
];

const CHART_DATA = [
  { label: "Batch", active: 30, total: 90 },
  { label: "Sheet Pan", active: 20, total: 45 },
  { label: "Slow Cooker", active: 15, total: 480 },
  { label: "Pressure", active: 25, total: 55 },
  { label: "Oven", active: 25, total: 65 },
  { label: "Steaming", active: 18, total: 35 },
];
const CHART_MAX = 480;
const CHART_HEIGHT = 200;

function RecipeImages() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {RECIPE_IMAGES.map((image) => (
        <div
          key={image.label}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-[12px] bg-gray-2 text-3xl"
          title={image.label}
        >
          <span aria-hidden>{image.emoji}</span>
        </div>
      ))}
    </div>
  );
}

function RecipeChart() {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-background-primary p-5",
        "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.3]",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <Text variant="label">Active Time vs. Total Time</Text>
        <ArrowDownIcon svgClasses="size-4" />
      </div>

      <div className="mb-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-blue-4" />
          <Text variant="caption" color="secondary">
            Active prep time
          </Text>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-[#7fbfbf]" />
          <Text variant="caption" color="secondary">
            Total cooking time
          </Text>
        </span>
      </div>

      <div
        className="flex items-end justify-between gap-2 border-b border-gray-2"
        style={{ height: CHART_HEIGHT }}
      >
        {CHART_DATA.map((bar) => (
          <div
            key={bar.label}
            className="flex flex-1 items-end justify-center gap-1"
          >
            <span
              className="w-1/2 max-w-3 rounded-t-[2px] bg-blue-4"
              style={{ height: (bar.active / CHART_MAX) * CHART_HEIGHT }}
            />
            <span
              className="w-1/2 max-w-3 rounded-t-[2px] bg-[#7fbfbf]"
              style={{ height: (bar.total / CHART_MAX) * CHART_HEIGHT }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2">
        {CHART_DATA.map((bar) => (
          <Text
            key={bar.label}
            variant="caption"
            color="secondary"
            className="flex-1 text-center"
          >
            {bar.label}
          </Text>
        ))}
      </div>
    </div>
  );
}

/** The visual artefact (images + chart) — rendered inline in default view and
 *  pinned to the right panel in split view. */
export function RecipeArtifact({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Text variant="label">Efficiency Comparison</Text>
      <RecipeImages />
      <RecipeChart />
    </div>
  );
}

const METHODS_LEFT = [
  {
    title: "Batch Cooking (Soups, Stews, Curries)",
    bestFor: "Chilis, curries, soups, stews, pulled meats",
    efficiency: "Make 4–6 portions in one large pot",
    yield: "4–6 meals from 30 min active time",
  },
  {
    title: "Sheet Pan Cooking",
    bestFor: "Proteins + vegetables, meal components",
    efficiency: "Cook proteins and sides simultaneously",
    yield: "2–4 complete meals in ~40 minutes",
  },
];
const METHODS_RIGHT = [
  {
    title: "Slow Cooker / Dutch Oven",
    bestFor: "Tough cuts, beans, whole grains, casseroles",
    efficiency: "Set in morning, ready at dinner; cook unattended",
    yield: "6–8 meals from 15 min active time",
  },
  {
    title: "Oven Roasting (Multiple Trays)",
    bestFor: "Vegetables, potatoes, root vegetables, tofu",
    efficiency: "Cook 2–3 sheet pans simultaneously at 425°F",
    yield: "3–4 components for 4–6 meals",
  },
];

function MethodSection({
  method,
}: {
  method: (typeof METHODS_LEFT)[number];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text variant="label">{method.title}</Text>
      <Text variant="label" color="secondary">
        <strong className="font-normal text-typography-primary">Best for:</strong>{" "}
        {method.bestFor}
      </Text>
      <Text variant="label" color="secondary">
        <strong className="font-normal text-typography-primary">Efficiency:</strong>{" "}
        {method.efficiency}
      </Text>
      <Text variant="label" color="secondary">
        <strong className="font-normal text-typography-primary">Yield:</strong>{" "}
        {method.yield}
      </Text>
    </div>
  );
}

/** The text/breakdown portion of the recipe answer (always in the conversation). */
export function RecipeBreakdown() {
  return (
    <div className="flex flex-col gap-5">
      <Text variant="title">Method Breakdown</Text>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          {METHODS_LEFT.map((method) => (
            <MethodSection key={method.title} method={method} />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {METHODS_RIGHT.map((method) => (
            <MethodSection key={method.title} method={method} />
          ))}
        </div>
      </div>

      <Text variant="title" className="mt-2">
        Strategic Meal Prep Approach
      </Text>
      <ol className="flex list-decimal flex-col gap-2 pl-5">
        <li>
          <Text variant="label" color="secondary">
            <strong className="font-normal text-typography-primary">
              Week 1 strategy:
            </strong>{" "}
            Slow cooker overnight → sheet-pan breakfast → pressure cooker for
            grains in the evening.
          </Text>
        </li>
        <li>
          <Text variant="label" color="secondary">
            <strong className="font-normal text-typography-primary">
              Batch base components:
            </strong>{" "}
            Cook 2 lbs rice, 2 lbs grains, 3 lbs protein, and roasted vegetables
            separately, then mix for variety.
          </Text>
        </li>
        <li>
          <Text variant="label" color="secondary">
            <strong className="font-normal text-typography-primary">
              Parallel cooking:
            </strong>{" "}
            Oven + stovetop + slow cooker simultaneously cover proteins, grains,
            and vegetables.
          </Text>
        </li>
      </ol>
    </div>
  );
}

export const RECIPE_TITLE = "Cooking Techniques for Meal Prep Efficiency";
export const RECIPE_INTRO =
  "Here are the most effective cooking methods for preparing multiple meals quickly, organized by efficiency and practicality:";

/** The complete answer: title, intro, artefact (images + chart) and breakdown.
 *  Rendered inline in default view and inside the side panel in split view. */
export function RecipeDocument() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Text variant="h3">{RECIPE_TITLE}</Text>
        <Text variant="body" color="secondary">
          {RECIPE_INTRO}
        </Text>
      </div>
      <RecipeArtifact />
      <RecipeBreakdown />
    </div>
  );
}

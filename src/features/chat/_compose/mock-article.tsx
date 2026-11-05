import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// DEV-ONLY mock "article" answer shown in the split-view side panel.

const TITLE = "The Glass Artists Who Mastered Museum Models";
const SUBTITLE =
  "A History of Marine Creatures, Botanical Illusion, and Impossible Craft";

const PARAGRAPHS = [
  "Leopold Blaschka and his son Rudolf Blaschka were master glassmakers whose work transformed scientific illustration into something approaching poetry. Working in Dresden from the late nineteenth century into the early twentieth, the pair created thousands of astonishingly detailed glass models of plants and marine invertebrates — jellyfish, anemones, orchids, sea slugs — at a time when such organisms were nearly impossible to preserve accurately for study.",
  "Leopold began as a traditional Bohemian glass artisan, descending from generations of craftsmen. During an ocean voyage in the 1850s, he became captivated by the translucent forms of sea creatures drifting beneath the water's surface. Museums and universities of the era relied on crude drawings or deteriorating specimens stored in alcohol, neither of which captured the delicacy of soft-bodied organisms. Leopold realized that glass, with its ability to transmit light and mimic translucency, could preserve these fleeting forms with unprecedented realism.",
  "Together, father and son developed techniques so intricate that many of their methods remain difficult to replicate today. Using lampworked glass, wire, enamel, pigments, and adhesives, they constructed models with microscopic accuracy and remarkable emotional presence. Their work occupied a rare space between scientific instrument and fine art. Their most celebrated achievement is the “Glass Flowers” collection commissioned by Harvard University in 1886. Over five decades, the Blaschkas produced more than four thousand botanical models for what is now the Harvard Museum of Natural History. The flowers appear impossibly alive: petals curling at the edges, leaves spotted with disease, roots tangled beneath the soil.",
  "Today, the Blaschkas' work endures as both scientific record and meditation on fragility, perception, and the human desire to preserve life against time.",
];

const CAPTION =
  "Specimen of Blaschka Marine Life: Physophora magnifica (Nr. 213), Leopold and Rudolf Blaschka, Dresden Germany, 1885. Lent by Cornell University, Department of Ecology and Evolutionary Biology.";

export function ArticleDocument() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <Text as="h1" variant="h1" className="max-w-[620px] leading-[1.1]">
          {TITLE}
        </Text>
        <Text variant="subtitle" color="secondary">
          {SUBTITLE}
        </Text>
      </header>

      {/* Two-column body on the left, figure pinned to the top-right. */}
      <div className="flex gap-8">
        <div className="flex-1 [column-fill:balance] sm:columns-2 sm:gap-6">
          {PARAGRAPHS.map((paragraph, index) => (
            <Text
              key={index}
              as="p"
              variant="body"
              className={cn(
                "mb-4 leading-[1.7]",
                index === 0 &&
                  "first-letter:float-left first-letter:pr-2 first-letter:pt-1 first-letter:text-[52px] first-letter:font-medium first-letter:leading-[0.8]",
              )}
            >
              {paragraph}
            </Text>
          ))}
        </div>

        <figure className="flex w-[250px] shrink-0 flex-col gap-3 self-start">
          <div
            className={cn(
              "grid aspect-[3/5] w-full place-items-center rounded-[16px] bg-black",
              "ring-2 ring-blue-5 shadow-[0_0_28px_rgba(56,128,255,0.45)]",
            )}
          >
            <span className="text-6xl" aria-hidden>
              🪼
            </span>
          </div>
          <figcaption>
            <Text variant="caption" color="secondary" className="leading-[1.5]">
              {CAPTION}
            </Text>
          </figcaption>
        </figure>
      </div>
    </article>
  );
}

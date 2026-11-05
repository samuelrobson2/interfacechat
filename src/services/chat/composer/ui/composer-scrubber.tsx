import { FloatingTool } from "@/shared/ui/dev-tool";

import { COMPOSER_SCRUB_FRAMES } from "../model/composer-motion";
import { useComposerExpandStore } from "../model/use-composer-expand";

const FRAME = 1 / COMPOSER_SCRUB_FRAMES;

export function ComposerScrubber() {
  const progress = useComposerExpandStore((state) => state.progress);
  const scrubberOpen = useComposerExpandStore((state) => state.scrubberOpen);
  const setProgress = useComposerExpandStore((state) => state.setProgress);
  const setScrubberOpen = useComposerExpandStore(
    (state) => state.setScrubberOpen,
  );
  const playTo = useComposerExpandStore((state) => state.playTo);
  const frame = Math.round(progress * COMPOSER_SCRUB_FRAMES);

  return (
    <FloatingTool
      id="composer-scrub"
      title="Composer"
      subtitle={`${Math.round(progress * 100)}% · ${frame}/${COMPOSER_SCRUB_FRAMES}`}
      collapsedLabel="Scrub"
      open={scrubberOpen}
      onOpenChange={setScrubberOpen}
    >
      <input
        type="range"
        min={0}
        max={COMPOSER_SCRUB_FRAMES}
        step={1}
        value={frame}
        aria-label="Scrub composer animation"
        onChange={(event) =>
          setProgress(Number(event.target.value) / COMPOSER_SCRUB_FRAMES)
        }
        className="w-full accent-white"
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-lg bg-white/10 px-2 py-1.5 text-[12px] hover:bg-white/15"
          onClick={() => setProgress(progress - FRAME)}
        >
          Prev frame
        </button>
        <button
          type="button"
          className="rounded-lg bg-white/10 px-2 py-1.5 text-[12px] hover:bg-white/15"
          onClick={() => setProgress(progress + FRAME)}
        >
          Next frame
        </button>
        <button
          type="button"
          className="rounded-lg bg-white/10 px-2 py-1.5 text-[12px] hover:bg-white/15"
          onClick={() => playTo(0)}
        >
          Compact
        </button>
        <button
          type="button"
          className="rounded-lg bg-white/10 px-2 py-1.5 text-[12px] hover:bg-white/15"
          onClick={() => playTo(1)}
        >
          Expanded
        </button>
      </div>
    </FloatingTool>
  );
}

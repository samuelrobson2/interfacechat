import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type CategorySlot,
  NUMI_ALT_COLORS,
  NUMI_BLUE_RAMP,
  NUMI_BOXPLOT,
  NUMI_CATEGORY_CEILING,
  NUMI_CATEGORY_FAMILIES,
  NUMI_CATEGORY_RANGE,
  NUMI_CORE_COLORS,
  NUMI_FADE,
  NUMI_FAMILIES,
  NUMI_FONT,
  type NumiFamily,
  NUMI_OTHER_FAMILY,
  NUMI_OTHER_SLOT,
  NUMI_PALETTE_PRESETS,
  NUMI_TINT_COLORS,
  categorySlots,
  gradientFill,
  isSolidSafe,
  numiVegaConfig,
} from "../numi-vega-config";

/**
 * These values are quoted verbatim in the agent prompt — the defaults table in
 * `docs/plot-agent-contract.md` §2. The agent uses them to resolve relative
 * edits ("make the labels bigger") and to avoid restating a default, which
 * would migrate the property out of the theme and into a stored spec.
 *
 * So a change to the theme is a change to the prompt. When this test fails,
 * update §2 of the contract in the same commit rather than relaxing the
 * assertion.
 */

const axis = numiVegaConfig.axis ?? {};
const legend = numiVegaConfig.legend ?? {};

/** The house fill: a vertical ramp from a family tint down to the page. */
const gradientTo = (tint: string) => ({
  gradient: "linear",
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 1,
  stops: [
    { offset: 0, color: tint },
    { offset: 1, color: NUMI_FADE },
  ],
});

/**
 * The two shapes a category slot comes in, restated here so the pins below read
 * as the pairing they describe rather than as four lines of token strings each.
 * The maps they are built from are pinned against hand-written tables further
 * down, so this is a shorthand and not a second copy of the palette.
 */
const tintOver = (family: NumiFamily): CategorySlot => ({
  family,
  step: "tint",
  fill: NUMI_TINT_COLORS[family],
  stroke: NUMI_CORE_COLORS[family],
});

const coreOver = (family: NumiFamily): CategorySlot => ({
  family,
  step: "core",
  fill: NUMI_CORE_COLORS[family],
  stroke: NUMI_ALT_COLORS[family],
});

describe("the theme defaults quoted in the agent contract", () => {
  it("paints every shape as a gradient inside a core edge", () => {
    // Fill and edge are one decision (contract §3.17): the ramp reaches the
    // page at its far stop and so carries no contrast of its own.
    expect(numiVegaConfig.bar).toMatchObject({
      fill: gradientTo(NUMI_TINT_COLORS.blue),
      stroke: NUMI_CORE_COLORS.blue,
      strokeWidth: 1,
      cornerRadius: 0,
      // Vega-Lite fills the whole band by default, which reads as a solid
      // block; 0.6 is the air the reference leaves around a bar.
      discreteBandSize: { band: 0.6 },
    });
    // An area's edge is the top curve alone. A `stroke` would box all four
    // sides, including the drop to the baseline and the chord back along it.
    expect(numiVegaConfig.area).toMatchObject({
      fill: gradientTo(NUMI_TINT_COLORS.blue),
      line: { stroke: NUMI_CORE_COLORS.blue, strokeWidth: 2 },
      interpolate: "monotone",
    });
    expect(numiVegaConfig.area).not.toHaveProperty("stroke");
    // The edge in the slice's own tone is what separates one slice from the
    // next; it replaces the surface-coloured gap the theme used to draw.
    expect(numiVegaConfig.arc).toMatchObject({
      fill: gradientTo(NUMI_TINT_COLORS.blue),
      stroke: NUMI_CORE_COLORS.blue,
      strokeWidth: 1,
    });
  });

  it("keeps ink and monochrome cells flat", () => {
    expect(numiVegaConfig.line).toMatchObject({
      stroke: NUMI_CORE_COLORS.blue,
      strokeWidth: 2,
      interpolate: "monotone",
    });
    expect(numiVegaConfig.point).toMatchObject({
      fill: NUMI_CORE_COLORS.blue,
      size: 50,
      opacity: 1,
    });
    // Vega-Lite washes both marks to 0.7 on a non-aggregated plot, and `tick`
    // reaches dumbbell markers, radar vertices and a boxplot's median.
    expect(numiVegaConfig.tick).toMatchObject({ opacity: 1 });
    // A heatmap cell is a step in a monochrome ramp, so it follows the second
    // house rule: flat, and no edge to draw a grid over the reading.
    expect(numiVegaConfig.rect).toMatchObject({ fill: NUMI_CORE_COLORS.blue });
    expect(numiVegaConfig.rect).not.toHaveProperty("stroke");
    expect(numiVegaConfig.rule).toMatchObject({
      stroke: "var(--chart-grid)",
      strokeWidth: 1,
    });
    expect(numiVegaConfig.text).toMatchObject({
      fontSize: 11,
      fontWeight: 300,
      fill: "var(--chart-label)",
    });
  });

  it("states no area opacity, in the config or anywhere it would leak", () => {
    // Two reasons, and both still hold. Vega-Lite copies the property into
    // every legend symbol encode, where nothing downstream can override it —
    // and a fill that already fades to the page cannot out-shout its own edge
    // line, which is what the old 0.18 wash existed to prevent.
    expect(numiVegaConfig.area).not.toHaveProperty("fillOpacity");
    expect(numiVegaConfig.bar).not.toHaveProperty("fillOpacity");
  });

  it("keeps axis typography and chrome as documented", () => {
    expect(axis).toMatchObject({
      labelColor: "var(--chart-label)",
      labelFontSize: 11,
      labelFontWeight: 300,
      labelPadding: 8,
      ticks: false,
      domainColor: "var(--chart-grid)",
      titleFontSize: 12,
      titlePadding: 12,
      grid: false,
    });
    expect(numiVegaConfig.axisX).toMatchObject({ labelAngle: 0 });
  });

  it("guards the axis gutter against an over-long category", () => {
    // Vega's own default, stated rather than inherited so it reaches the
    // target's `current_values` and an edit has a number to move from. Left
    // implicit, "shorten the labels" has nothing to anchor to.
    expect(axis).toMatchObject({ labelLimit: 180, labelOverlap: "greedy" });
    // `greedy` keeps a label whose box merely touches its neighbour's, which
    // on a dense axis reads as one run-on string. Two pixels of required air
    // is what makes it drop that label instead — so the pair is one decision
    // and neither half is meaningful pinned alone.
    expect(axis).toMatchObject({ labelSeparation: 2 });
  });

  it("keeps the dashed grid on value axes only", () => {
    expect(numiVegaConfig.axisQuantitative).toMatchObject({
      grid: true,
      gridColor: "var(--chart-grid)",
      gridDash: [2, 4],
      gridOpacity: 0.6,
      tickCount: 5,
    });
    expect(numiVegaConfig.axisTemporal).toMatchObject({
      grid: true,
      gridDash: [2, 4],
    });
    expect(numiVegaConfig.axisDiscrete).toMatchObject({ grid: false });
  });

  it("keeps the legend and title as documented", () => {
    expect(legend).toMatchObject({
      orient: "top",
      title: null,
      labelFontSize: 12,
      labelOffset: 6,
      // Raised from Vega's 160: house labels carry the category's own number
      // (§5), and at 160 that number is what falls off the end.
      labelLimit: 240,
      symbolType: "square",
      symbolSize: 81,
      // 1, not 0. On a multi-series gradient chart the outline is the only
      // channel that identifies the series, because a conditional gradient
      // reaches every swatch as the same tone.
      symbolStrokeWidth: 1,
      columnPadding: 14,
      rowPadding: 4,
    });
    expect(numiVegaConfig.title).toMatchObject({
      color: "var(--chart-label-strong)",
      fontSize: 18,
      fontWeight: 400,
      anchor: "start",
      subtitleFontSize: 12,
    });
  });

  it("keeps the boxplot parts on the documented tokens", () => {
    // The same bargain a gradient makes: a pale interior that clears nothing on
    // its own, behind an edge in a tone that does.
    //
    // The box is the raw stop and not the `tint-blue` role, because a box is read
    // against its own edge: in dark mode the tint is `blue-30` and the core is
    // `blue-40`, adjacent stops at 1.52:1, and the edge disappears. Pinned at
    // `blue-20` the pair holds at 2.16:1 dark and 3.33:1 light.
    expect(NUMI_BOXPLOT).toEqual({
      box: "var(--chart-blue-20)",
      edge: "var(--chart-core-blue)",
      median: "var(--chart-blue-60)",
    });
    expect(NUMI_BOXPLOT.box).not.toBe(NUMI_TINT_COLORS.blue);
    expect(numiVegaConfig.boxplot).toMatchObject({
      box: { fill: NUMI_BOXPLOT.box, stroke: NUMI_BOXPLOT.edge },
      median: { color: NUMI_BOXPLOT.median, strokeWidth: 2 },
      rule: { color: NUMI_BOXPLOT.edge, strokeWidth: 1.5 },
      outliers: { fill: "transparent", size: 28 },
    });
  });

  it("keeps the palettes and the named styles", () => {
    expect(numiVegaConfig.range?.category).toEqual(NUMI_CATEGORY_RANGE);
    // Seven families rotate, not eight: the palette carries eight, and yellow
    // is held back for an aggregated "Other" so a real category can never be
    // painted in the tone its own residual uses. Past seven a hue is spent
    // twice rather than a new one being invented (see `categorySlots`).
    expect(NUMI_CATEGORY_RANGE).toHaveLength(7);
    expect(NUMI_CATEGORY_RANGE).toEqual([
      "var(--chart-core-blue)",
      "var(--chart-core-mint)",
      "var(--chart-core-indigo)",
      "var(--chart-core-rose)",
      "var(--chart-core-warm)",
      "var(--chart-core-chartreuse)",
      "var(--chart-core-gray)",
    ]);
    // Four distinct stops, light to dark, and the widest separation the family
    // offers — this ramp has to survive being read as adjacent heatmap cells.
    expect(NUMI_BLUE_RAMP).toEqual([
      "var(--chart-blue-10)",
      "var(--chart-blue-20)",
      "var(--chart-blue-40)",
      "var(--chart-blue-60)",
    ]);
    expect(new Set(NUMI_BLUE_RAMP).size).toBe(NUMI_BLUE_RAMP.length);
    expect(Object.keys(NUMI_PALETTE_PRESETS).sort()).toEqual([
      "blue",
      "mint",
      "warm",
    ]);
    expect(NUMI_PALETTE_PRESETS.blue).toEqual(NUMI_BLUE_RAMP);
    // The gallery's colour table assigns these three tones to timeouts, server
    // and client failures in this order. A preset is applied positionally, so
    // the order is the mapping — reordering it re-skins the reference card.
    expect(NUMI_PALETTE_PRESETS.warm).toEqual([
      "var(--chart-warm-60)",
      "var(--chart-warm-50)",
      "var(--chart-warm-40)",
    ]);
    expect(numiVegaConfig.style?.["value-label"]).toMatchObject({
      fontSize: 16,
      fill: "var(--chart-label-strong)",
    });
    expect(numiVegaConfig.style?.["data-label"]).toMatchObject({
      fontSize: 11,
      fontWeight: 400,
      // A text mark has no gutter to widen the way an axis does, so an
      // over-long label just runs across its neighbours. Truncation keeps the
      // damage local, and the number has to be stated for the same reason
      // `axis.labelLimit` is: the agent edits it by moving it.
      limit: 120,
    });
  });

  it("publishes every text style under both names Vega-Lite reads", () => {
    // Vega-Lite looks a text mark's size and colour up in `config.style` under
    // the channel names `size` and `color`, but in `config.text` under the Vega
    // names `fontSize` and `fill`. A style that states only the Vega names
    // loses to `config.text` and paints nothing — and does it silently, since
    // the weight still lands and the mark still draws. This is how `value-label`
    // spent its life rendering at the 11px default.
    for (const [name, style] of Object.entries(numiVegaConfig.style ?? {})) {
      const text = style as Record<string, unknown>;
      if (text.fontSize === undefined) continue;

      expect(text.size, `${name} states no \`size\``).toBe(text.fontSize);
      expect(text.color, `${name} states no \`color\``).toBe(text.fill);
    }
  });

  it("paints charts from the chart namespace only", () => {
    // A `--color-*` token would be the UI palette, which the chart palette
    // renumbers and extends. Charts resolve through `app/styles/chart-colors.css`.
    const tokens = JSON.stringify([
      numiVegaConfig,
      NUMI_CATEGORY_RANGE,
      NUMI_BLUE_RAMP,
      NUMI_PALETTE_PRESETS,
      NUMI_CORE_COLORS,
      NUMI_TINT_COLORS,
      NUMI_ALT_COLORS,
      NUMI_OTHER_SLOT,
      categorySlots(NUMI_CATEGORY_CEILING),
      NUMI_BOXPLOT,
    ]).match(/var\(--[\w-]+\)/g);

    expect(tokens?.length).toBeGreaterThan(0);
    expect(
      [...new Set(tokens)].filter((t) => !t.startsWith("var(--chart-")),
    ).toEqual([]);
  });

  it("leaves the surface to the card and the font as a literal stack", () => {
    expect(numiVegaConfig.background).toBe("transparent");
    expect(numiVegaConfig.padding).toBe(0);
    expect(numiVegaConfig.view).toMatchObject({ stroke: null });
    // A token here would be measured by canvas and silently mis-size the axes.
    expect(NUMI_FONT).not.toMatch(/var\(/);
    expect(numiVegaConfig.font).toBe(NUMI_FONT);
  });
});

/**
 * The gradient is only legible because something that clears the contrast floor
 * is drawn round it, so the two halves of that pairing are worth pinning
 * separately: the tints must stay below the floor (otherwise the rule is
 * arbitrary), and the cores must stay above it (otherwise nothing carries the
 * reading).
 */
describe("the gradient and its edge", () => {
  it("fades every family from its own tint to the page", () => {
    for (const family of NUMI_FAMILIES) {
      expect(gradientFill(family)).toEqual(
        gradientTo(NUMI_TINT_COLORS[family]),
      );
    }
  });

  it("never fades to transparent, and never to the surface", () => {
    // `transparent` is transparent *black*, and SVG interpolates colour and
    // alpha independently, so a ramp towards it greys out on the way down.
    expect(NUMI_FADE).not.toBe("transparent");
    // The surface is the #fafafa canvas; the fade is pure white. They agree in
    // dark mode and differ in light, which is what the palette frame spells as
    // "to White" — a fill lifts off the card rather than dissolving into it.
    expect(NUMI_FADE).not.toBe("var(--chart-surface)");
    expect(NUMI_FADE).toBe("var(--chart-fade)");
  });

  it("keeps every tint below the floor and every core above it", () => {
    for (const family of NUMI_FAMILIES) {
      expect(isSolidSafe(NUMI_TINT_COLORS[family])).toBe(false);
      expect(isSolidSafe(NUMI_CORE_COLORS[family])).toBe(true);
      // `alt` is the family's *second* accessible step, so it is judged by the
      // same floor as `core` — it is an edge and a flat fill in its own right,
      // not a pale interior.
      expect(isSolidSafe(NUMI_ALT_COLORS[family])).toBe(true);
    }
    // The fade is the far stop of a ramp, not a fill in its own right.
    expect(isSolidSafe(NUMI_FADE)).toBe(false);
  });
});

/**
 * Eight families, seven of which rotate. The eighth is spoken for, and the
 * rotation runs out at seven long before a chart does — so the palette needs a
 * rule for the eighth category that is neither "wrap back to blue" (two
 * categories in one tone) nor "invent a hue" (off the frame). Spending a family
 * twice, at two depths, in adjacent slots is that rule, and the adjacency is
 * the whole point: a reader has to see one family shown twice rather than a
 * rotation that quietly lapped itself.
 */
describe("the category rotation and the paint it hands out", () => {
  it("rotates seven of the eight families and reserves the last", () => {
    expect(NUMI_FAMILIES).toHaveLength(8);
    expect(NUMI_OTHER_FAMILY).toBe("yellow");
    // Held out, not merely last: if yellow ever re-entered the rotation an
    // eight-category chart would paint a real series in the residual's tone.
    expect(NUMI_CATEGORY_FAMILIES).not.toContain(NUMI_OTHER_FAMILY);
    expect(NUMI_CATEGORY_FAMILIES).toEqual([
      "blue",
      "mint",
      "indigo",
      "rose",
      "warm",
      "chartreuse",
      "gray",
    ]);
    // The range is the rotation's cores, in the rotation's order, and nothing
    // else — the theme applies it to any plain `color` encoding.
    expect(NUMI_CATEGORY_RANGE).toEqual(
      NUMI_CATEGORY_FAMILIES.map((family) => NUMI_CORE_COLORS[family]),
    );
    // The residual is painted by the ordinary rule, not by a special case: it
    // is the reserved family's pale slot inside its own core edge.
    expect(NUMI_OTHER_SLOT).toEqual(tintOver(NUMI_OTHER_FAMILY));
    expect(NUMI_OTHER_SLOT).toEqual({
      family: "yellow",
      step: "tint",
      fill: "var(--chart-tint-yellow)",
      stroke: "var(--chart-core-yellow)",
    });
  });

  it("gives each category a hue of its own while there are hues left", () => {
    expect(categorySlots(1)).toEqual([tintOver("blue")]);

    const seven = categorySlots(NUMI_CATEGORY_FAMILIES.length);
    expect(seven).toEqual(NUMI_CATEGORY_FAMILIES.map(tintOver));
    expect(new Set(seven.map((slot) => slot.family)).size).toBe(7);
    // Every slot is the pale step while the palette is not yet under pressure;
    // `core` fills only appear once a family has to be spent twice.
    expect(seven.every((slot) => slot.step === "tint")).toBe(true);
  });

  it("spends a hue twice past seven, at two depths and side by side", () => {
    // Eight does not append a slot to the seven above — it repaints the whole
    // run from four families, because a pair has to sit together and the last
    // three families are simply not used. A domain that grows by one category
    // therefore re-skins the chart, which is intended: the alternative is one
    // odd doubled family buried in the middle of a single-hue run.
    expect(categorySlots(8)).toEqual([
      tintOver("blue"),
      coreOver("blue"),
      tintOver("mint"),
      coreOver("mint"),
      tintOver("indigo"),
      coreOver("indigo"),
      tintOver("rose"),
      coreOver("rose"),
    ]);
    // An odd count leaves the last family with the pale slot alone rather than
    // dropping a category or starting a fifth pair.
    expect(categorySlots(9)).toEqual([
      tintOver("blue"),
      coreOver("blue"),
      tintOver("mint"),
      coreOver("mint"),
      tintOver("indigo"),
      coreOver("indigo"),
      tintOver("rose"),
      coreOver("rose"),
      tintOver("warm"),
    ]);
    // The ceiling is every rotation family spent twice, and nothing beyond.
    expect(NUMI_CATEGORY_CEILING).toBe(14);
    expect(NUMI_CATEGORY_CEILING).toBe(NUMI_CATEGORY_FAMILIES.length * 2);
    expect(categorySlots(NUMI_CATEGORY_CEILING)).toEqual(
      NUMI_CATEGORY_FAMILIES.flatMap((family) => [
        tintOver(family),
        coreOver(family),
      ]),
    );
  });

  it("keeps the two spends of a family adjacent at every size", () => {
    for (let count = 1; count <= NUMI_CATEGORY_CEILING; count += 1) {
      const slots = categorySlots(count);
      expect(slots).toHaveLength(count);

      const seen = new Map<NumiFamily, number[]>();
      slots.forEach((slot, index) => {
        seen.set(slot.family, [...(seen.get(slot.family) ?? []), index]);
      });

      for (const [family, indexes] of seen) {
        // Three spends of one hue would be indistinguishable from a wrap.
        expect(indexes.length).toBeLessThanOrEqual(2);
        if (indexes.length === 1) continue;
        // Neighbours, and pale before solid — a family read top to bottom.
        const [pale, solid] = indexes as [number, number];
        expect(solid - pale).toBe(1);
        expect(slots[pale]).toEqual(tintOver(family));
        expect(slots[solid]).toEqual(coreOver(family));
      }
    }
  });

  it("gives every slot an edge the reader can find", () => {
    // The fill carries no contrast of its own at either depth — `tint` is
    // below the floor by design, and `core` is only above it against the
    // canvas, not against the tint beside it. The stroke is what separates one
    // slot from the next, so it is the half that must clear the floor.
    for (let count = 1; count <= NUMI_CATEGORY_CEILING; count += 1) {
      for (const slot of categorySlots(count)) {
        expect(isSolidSafe(slot.stroke)).toBe(true);
        expect(isSolidSafe(slot.fill)).toBe(slot.step === "core");
      }
    }
    expect(isSolidSafe(NUMI_OTHER_SLOT.stroke)).toBe(true);
  });

  it("refuses a domain the palette cannot carry, and an empty one", () => {
    expect(() => categorySlots(NUMI_CATEGORY_CEILING + 1)).toThrow(/14/);
    // The message has to name the way out, because it is the only place the
    // caller is told that "Other" is the answer rather than a longer palette.
    expect(() => categorySlots(99)).toThrow(/"Other"/);
    // Nothing to paint is not an error — an empty domain is a legal chart.
    expect(categorySlots(0)).toEqual([]);
    expect(categorySlots(-1)).toEqual([]);
  });
});

/**
 * The palette frame designates one stop per family "core" per theme and leaves
 * the lighter stops for gradient tints, pattern fills and ramp steps, because
 * those fall under WCAG 3:1 against the canvas. That split is only worth
 * encoding if nothing paints flat marks from the wrong half of it.
 */
describe("the core / pattern-only split", () => {
  it("names a core, a tint and an alt for every family the palette carries", () => {
    const families = [...NUMI_FAMILIES].sort();
    expect(families).toEqual([
      "blue",
      "chartreuse",
      "gray",
      "indigo",
      "mint",
      "rose",
      "warm",
      "yellow",
    ]);
    // A role tier with a hole in it is a family that silently falls back to
    // `undefined` the moment a slot reaches for it, so all three are checked
    // against the family list rather than against each other.
    for (const tier of [NUMI_CORE_COLORS, NUMI_TINT_COLORS, NUMI_ALT_COLORS]) {
      expect(Object.keys(tier).sort()).toEqual(families);
    }
    // Green was retired two revisions ago, and so was the brown family.
    expect(NUMI_CORE_COLORS).not.toHaveProperty("green");
    expect(NUMI_CORE_COLORS).not.toHaveProperty("brown");
    // The solid tone per family, pinned against a hand-written table so a
    // rename in the stylesheet cannot be absorbed silently here.
    expect(NUMI_CORE_COLORS).toEqual({
      blue: "var(--chart-core-blue)",
      mint: "var(--chart-core-mint)",
      indigo: "var(--chart-core-indigo)",
      rose: "var(--chart-core-rose)",
      warm: "var(--chart-core-warm)",
      chartreuse: "var(--chart-core-chartreuse)",
      gray: "var(--chart-core-gray)",
      yellow: "var(--chart-core-yellow)",
    });
    // The near stop of every gradient the theme paints, pinned the same way.
    expect(NUMI_TINT_COLORS).toEqual({
      blue: "var(--chart-tint-blue)",
      mint: "var(--chart-tint-mint)",
      indigo: "var(--chart-tint-indigo)",
      rose: "var(--chart-tint-rose)",
      warm: "var(--chart-tint-warm)",
      chartreuse: "var(--chart-tint-chartreuse)",
      gray: "var(--chart-tint-gray)",
      yellow: "var(--chart-tint-yellow)",
    });
    // The second accessible step, and a role rather than a numbered stop for
    // the usual reason: it moves *away from the canvas*, which is the darkest
    // stop in light and the lightest in dark. A raw stop could not do both.
    expect(NUMI_ALT_COLORS).toEqual({
      blue: "var(--chart-alt-blue)",
      mint: "var(--chart-alt-mint)",
      indigo: "var(--chart-alt-indigo)",
      rose: "var(--chart-alt-rose)",
      warm: "var(--chart-alt-warm)",
      chartreuse: "var(--chart-alt-chartreuse)",
      gray: "var(--chart-alt-gray)",
      yellow: "var(--chart-alt-yellow)",
    });
  });

  it("refuses the near-white grays as a fill and keeps the readable ones", () => {
    // The 08/26 frame inserted #e5e5e5 at gray-20 and pushed every darker stop
    // down one, so this list did not gain an entry — it moved wholesale, and
    // anything still reading a gray by its old number is now one step off.
    //
    // gray-0 #ffffff, gray-10 #fafafa, gray-15 #f5f5f5 and gray-70 #f3f2f3 are
    // four near-whites within seven points of each other and of the canvas;
    // gray-20 #e5e5e5 is the tint and gray-30 #c4c4c4 the gridline tone. None
    // can carry a flat mark. The suffix is not a darkness rank — gray-70 is
    // the lightest stop in the whole ramp.
    for (const gray of ["0", "10", "15", "20", "30", "70"]) {
      expect(isSolidSafe(`var(--chart-gray-${gray})`)).toBe(false);
    }
    // gray-40 #7a7a7a is the light core, gray-50 #373737 is the dark canvas
    // and light mode's `alt`, gray-60 #1a1718 is the darkest stop. All three
    // clear 3:1 on light, which is the canvas a raw stop is judged against.
    for (const gray of ["40", "50", "60"]) {
      expect(isSolidSafe(`var(--chart-gray-${gray})`)).toBe(true);
    }
  });

  it("refuses the pale yellow stops now that yellow is a full family", () => {
    // Yellow arrived as a whole family rather than one residual tone, so its
    // pale half needs the same veto every other family's has: 10 #f5efd6,
    // 20 #eddd99 and 30 #bead76 all sit under 3:1 on the light canvas, and
    // 30 is the *dark* core — safe there, unreadable here.
    for (const stop of ["10", "20", "30"]) {
      expect(isSolidSafe(`var(--chart-yellow-${stop})`)).toBe(false);
    }
    // 40 #ab8813 is the light core and the first stop that clears the floor.
    expect(isSolidSafe("var(--chart-yellow-40)")).toBe(true);
  });

  it("never hands a categorical series a tone the reader cannot find", () => {
    // The theme applies this range to any plain `color` encoding, so an unsafe
    // entry here is an unsafe flat mark in every multi-series chart.
    for (const color of NUMI_CATEGORY_RANGE) {
      expect(isSolidSafe(color)).toBe(true);
    }
  });

  it("keeps the flat default fills solid-safe", () => {
    // Only the marks the house paints flat. A shape's fill is a gradient
    // object, and its safety comes from the edge beside it, not from the tint.
    const flat = [
      numiVegaConfig.line?.stroke,
      numiVegaConfig.point?.fill,
      numiVegaConfig.rect?.fill,
      numiVegaConfig.bar?.stroke,
      numiVegaConfig.arc?.stroke,
    ];

    for (const paint of flat) {
      expect(typeof paint).toBe("string");
      expect(isSolidSafe(paint as string)).toBe(true);
    }
  });

  it("allows the unsafe tints through a sequential ramp", () => {
    // The blue ramp is the documented exception: a legend explains the scale,
    // so the pale steps are read as low values rather than as lost marks.
    expect(NUMI_BLUE_RAMP.some((color) => !isSolidSafe(color))).toBe(true);
  });
});

/**
 * Every `--chart-*` the theme names has to be declared in `chart-colors.css`.
 *
 * An undefined `var()` is silent: Vega copies the string straight into the SVG
 * attribute and the browser paints nothing, so a token lost to a renumbering
 * does not throw — it draws the wrong colour or none at all. Reading the sheet
 * as text is the only way to see that from here, because jsdom carries no
 * stylesheet and `getComputedStyle` would report every token as empty.
 */
const here = dirname(fileURLToPath(import.meta.url));

/** Only real declarations, so a token named inside a comment does not count. */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "");

const css = stripComments(
  readFileSync(
    resolve(here, "../../../../app/styles/chart-colors.css"),
    "utf8",
  ),
);

const declaredIn = (selector: string): Set<string> => {
  const at = css.indexOf(selector);
  if (at === -1)
    throw new Error(`\`${selector}\` is missing from the stylesheet`);
  const open = css.indexOf("{", at);
  return new Set(
    [
      ...css
        .slice(open, css.indexOf("}", open))
        .matchAll(/(--chart-[\w-]+)\s*:/g),
    ].map((match) => match[1] as string),
  );
};

/**
 * Scanned from the module's source rather than from its exports, because the
 * two lists that decide `isSolidSafe` are module-private: nothing exported ever
 * mentions `--chart-yellow-30`, so a typo in that list is invisible from the
 * outside and would quietly declare an unsafe tone safe.
 */
const NAMED = new Set(
  [
    ...stripComments(
      readFileSync(resolve(here, "../numi-vega-config.ts"), "utf8"),
    ).matchAll(/var\((--chart-[\w-]+)\)/g),
  ].map((match) => match[1] as string),
);

const ROOT = declaredIn(":root");
const DARK = declaredIn(".dark-region");

describe("the tokens the theme names", () => {
  it("declares every one of them in the stylesheet", () => {
    // A pattern-only stop, reachable from nowhere but the private list — its
    // presence is what proves the scan sees more than the exported maps.
    expect(NAMED.has("--chart-yellow-30")).toBe(true);
    expect(NAMED.size).toBeGreaterThan(NUMI_FAMILIES.length * 3);
    expect([...NAMED].filter((token) => !ROOT.has(token))).toEqual([]);
  });

  it("re-declares every role it names in dark mode", () => {
    // Family stops mean the same hex in both themes; roles do not. A role the
    // dark block forgets inherits its light tone and paints it on the dark
    // canvas — the exact contrast failure the per-theme core exists to prevent.
    // `alt` has to be here for a sharper reason still: it moves away from the
    // canvas, so light's darkest stop is dark's lightest, and inheriting it
    // would put the second step of a pair on the wrong side of its own core.
    const roles = [...NAMED].filter((token) =>
      /^--chart-(core|tint|alt|fade)/.test(token),
    );
    expect(roles).toHaveLength(NUMI_FAMILIES.length * 3 + 1);
    expect(roles.filter((token) => !DARK.has(token))).toEqual([]);
  });
});

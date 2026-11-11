import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InlineMedium } from "../../inline/inline-medium";
import { InlineSmall } from "../../inline/inline-small";
import { inlineDetail } from "../../inline/inline-summary";
import { InterfaceShell, type InterfaceShellProps } from "../../interface-shell";
import { SHELL_FIXTURES } from "../shell-fixtures";
import { CHART_TYPES, SHELL_SIZES, type ChartShellData } from "../shell-types";

const sample = SHELL_FIXTURES.chart.states.history;
const as = (type: ChartShellData["type"]): ChartShellData => ({ ...sample, type });

describe("chart", () => {
  it.each(CHART_TYPES.flatMap((type) => SHELL_SIZES.map((size) => [type, size] as const)))(
    "draws a %s at %s",
    (type, size) => {
      const html = renderToString(
        <InterfaceShell {...({ kind: "chart", size, data: as(type), onChange: () => {} } as InterfaceShellProps)} />,
      );
      expect(html.length).toBeGreaterThan(0);
    },
  );

  it.each(CHART_TYPES)("draws a %s inline, and names its type", (type) => {
    expect(renderToString(<InlineMedium kind="chart" data={as(type)} />).length).toBeGreaterThan(0);
    expect(renderToString(<InlineSmall kind="chart" data={as(type)} />).length).toBeGreaterThan(0);
    expect(inlineDetail("chart", as(type))).toMatch(/^(Mind map|Timeline|Flowchart) · /);
  });

  it("keeps every type's content, whichever it shows", () => {
    expect(sample.branches.length).toBeGreaterThan(0);
    expect(sample.events.length).toBeGreaterThan(0);
    expect(sample.nodes.length).toBeGreaterThan(0);
  });
});

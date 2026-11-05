import type { TooltipHandler } from "vega";

const OFFSET_PX = 12;

const applySurfaceStyle = (el: HTMLDivElement) => {
  Object.assign(el.style, {
    position: "fixed",
    zIndex: "40",
    pointerEvents: "none",
    padding: "8px 10px",
    borderRadius: "0",
    border: "1px solid var(--color-gray-2)",
    backgroundColor: "var(--color-background-primary, #fafafa)",
    color: "var(--color-typography-primary)",
    font: '300 12px/1.35 "STK Bureau Sans", sans-serif',
    whiteSpace: "nowrap",
    boxShadow: "none",
  } satisfies Partial<CSSStyleDeclaration>);
};

const appendRow = (el: HTMLDivElement, key: string | null, value: string) => {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "10px";
  row.style.justifyContent = "space-between";
  if (key !== null) {
    const k = document.createElement("span");
    k.style.color = "var(--color-typography-secondary)";
    k.textContent = key;
    row.append(k);
  }
  const v = document.createElement("span");
  v.textContent = value;
  row.append(v);
  el.append(row);
};

/**
 * Tooltip in the dashboard's visual language: square corners, hairline border,
 * 12px light type.
 */
export const createNumiTooltip = (host: HTMLElement) => {
  let el: HTMLDivElement | null = null;

  const hide = () => {
    el?.remove();
    el = null;
  };

  const handler: TooltipHandler = (_handler, event, _item, value) => {
    if (value === null || value === undefined || value === "") {
      hide();
      return;
    }

    if (!el) {
      el = document.createElement("div");
      applySurfaceStyle(el);
      host.append(el);
    }
    el.replaceChildren();

    if (typeof value === "object") {
      for (const [key, raw] of Object.entries(
        value as Record<string, unknown>,
      )) {
        appendRow(el, key, raw === null ? "—" : String(raw));
      }
    } else {
      appendRow(el, null, String(value));
    }

    const { width, height } = el.getBoundingClientRect();
    const x =
      event.clientX + OFFSET_PX + width > window.innerWidth
        ? event.clientX - OFFSET_PX - width
        : event.clientX + OFFSET_PX;
    const y =
      event.clientY + OFFSET_PX + height > window.innerHeight
        ? event.clientY - OFFSET_PX - height
        : event.clientY + OFFSET_PX;
    el.style.left = `${Math.max(0, x)}px`;
    el.style.top = `${Math.max(0, y)}px`;
  };

  return { handler, destroy: hide };
};

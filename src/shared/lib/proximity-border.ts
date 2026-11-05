/**
 * Iridescent proximity border effect.
 *
 * A thin SVG overlay sits on top of an element. When the cursor approaches
 * within ~120px of the element edge, the stretch of border nearest the cursor
 * grows outward into a sharp organic spike (up to 18px), then retreats when the
 * cursor enters the element. The border is an animated iridescent line
 * (teal → mauve → rose → blush, cycling slowly) with a soft glow underneath.
 *
 * Usage:
 *   const detach = attachProximityBorder(el)          // attach to one element
 *   initProximityBorders("button")                    // auto-apply to a selector
 */

export interface ProximityBorderOptions {
  /** Number of points distributed around the perimeter. */
  pointCount?: number;
  /** Corner radius used when laying out the perimeter (px). */
  cornerRadius?: number;
  /** Cursor distance at which the effect starts (px). */
  proximity?: number;
  /** Maximum outward spike length (px). */
  maxReach?: number;
  /** Angular half-width of the spike along the perimeter (0..1 of perimeter). */
  angularSpread?: number;
  /** Sharpness of the spike falloff. */
  spikePower?: number;
  /** Falloff exponent of the global proximity strength. */
  strengthPower?: number;
  /** Per-frame easing toward target positions (0..1). */
  lerp?: number;
  /** Depth (px) over which the effect fades to zero once the cursor is inside. */
  insideFade?: number;
  /** Gradient color cycling speed. */
  colorSpeed?: number;
  /** Crisp line stroke width (px). */
  lineWidth?: number;
  /** Glow blur std deviation (px). */
  glowBlur?: number;
  /** Peak opacity of the glow layer. */
  glowOpacity?: number;
  /** Resting border color, always visible, that the iridescent line grows from.
   *  Empty string disables it (just the fading iridescent line). */
  restStroke?: string;
  /** Resting border stroke width (px). */
  restWidth?: number;
  /** Opacity of the iridescent line at rest (no cursor). Its colors still cycle,
   *  so the border is visible and moving even when the cursor is far away. */
  baseOpacity?: number;
}

const DEFAULTS: Required<ProximityBorderOptions> = {
  pointCount: 160,
  cornerRadius: 8,
  proximity: 120,
  maxReach: 18,
  angularSpread: 0.07,
  spikePower: 3.5,
  strengthPower: 1.8,
  lerp: 0.09,
  insideFade: 16,
  colorSpeed: 0.0008,
  lineWidth: 0.75,
  glowBlur: 1.5,
  glowOpacity: 0.45,
  restStroke: "",
  restWidth: 1,
  baseOpacity: 0,
};

// teal, mauve, rose, blush, sky, lilac
const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [76, 194, 194],
  [180, 138, 217],
  [232, 122, 166],
  [246, 207, 226],
  [143, 192, 238],
  [196, 166, 240],
];

const STOP_COUNT = 6;
const SVGNS = "http://www.w3.org/2000/svg";

function paletteColor(t: number): string {
  const wrapped = ((t % 1) + 1) % 1;
  const scaled = wrapped * PALETTE.length;
  const i = Math.floor(scaled) % PALETTE.length;
  const j = (i + 1) % PALETTE.length;
  const f = scaled - Math.floor(scaled);
  const a = PALETTE[i]!;
  const b = PALETTE[j]!;
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r}, ${g}, ${bl})`;
}

interface BorderPoint {
  bx: number;
  by: number;
  nx: number;
  ny: number;
  t: number; // normalized perimeter position [0,1)
  cx: number; // current (eased) position
  cy: number;
}

function cornerPoint(cx: number, cy: number, r: number, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: cx + r * c, y: cy + r * s, nx: c, ny: s };
}

// Lay out N points evenly by arc length around a rounded rectangle, each with
// an outward unit normal.
function buildPoints(w: number, h: number, radius: number, n: number): BorderPoint[] {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const sw = Math.max(0, w - 2 * r);
  const sh = Math.max(0, h - 2 * r);
  const arc = (Math.PI / 2) * r;
  const perim = 2 * sw + 2 * sh + 4 * arc;
  if (perim <= 0) return [];

  const segments: { len: number; at: (s: number) => { x: number; y: number; nx: number; ny: number } }[] = [
    { len: sw, at: (s) => ({ x: r + s, y: 0, nx: 0, ny: -1 }) },
    { len: arc, at: (s) => cornerPoint(w - r, r, r, -Math.PI / 2 + (s / arc) * (Math.PI / 2)) },
    { len: sh, at: (s) => ({ x: w, y: r + s, nx: 1, ny: 0 }) },
    { len: arc, at: (s) => cornerPoint(w - r, h - r, r, (s / arc) * (Math.PI / 2)) },
    { len: sw, at: (s) => ({ x: w - r - s, y: h, nx: 0, ny: 1 }) },
    { len: arc, at: (s) => cornerPoint(r, h - r, r, Math.PI / 2 + (s / arc) * (Math.PI / 2)) },
    { len: sh, at: (s) => ({ x: 0, y: h - r - s, nx: -1, ny: 0 }) },
    { len: arc, at: (s) => cornerPoint(r, r, r, Math.PI + (s / arc) * (Math.PI / 2)) },
  ];

  const last = segments[segments.length - 1]!;
  const points: BorderPoint[] = [];
  for (let i = 0; i < n; i++) {
    const target = (i / n) * perim;
    let acc = 0;
    let placed = last.at(last.len);
    for (const seg of segments) {
      if (target <= acc + seg.len) {
        placed = seg.at(target - acc);
        break;
      }
      acc += seg.len;
    }
    points.push({ bx: placed.x, by: placed.y, nx: placed.nx, ny: placed.ny, t: i / n, cx: placed.x, cy: placed.y });
  }
  return points;
}

function catmullRomClosed(points: BorderPoint[]): string {
  const n = points.length;
  if (n < 3) return "";
  const first = points[0]!;
  let d = `M ${first.cx.toFixed(2)} ${first.cy.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;
    const cp1x = p1.cx + (p2.cx - p0.cx) / 6;
    const cp1y = p1.cy + (p2.cy - p0.cy) / 6;
    const cp2x = p2.cx - (p3.cx - p1.cx) / 6;
    const cp2y = p2.cy - (p3.cy - p1.cy) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.cx.toFixed(2)} ${p2.cy.toFixed(2)}`;
  }
  return `${d} Z`;
}

// ---- Shared global pointer + animation loop ----

const mouse = { x: -1e5, y: -1e5 };
const registry = new Set<ProximityBorder>();
let rafId = 0;
let listening = false;

function onPointerMove(event: PointerEvent) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}

function ensureLoop() {
  if (listening) return;
  listening = true;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  const tick = (now: number) => {
    registry.forEach((b) => b.frame(now));
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function maybeStopLoop() {
  if (registry.size > 0 || !listening) return;
  listening = false;
  window.removeEventListener("pointermove", onPointerMove);
  cancelAnimationFrame(rafId);
}

let uid = 0;

class ProximityBorder {
  private el: HTMLElement;
  private opts: Required<ProximityBorderOptions>;
  private svg: SVGSVGElement;
  private glowPath: SVGPathElement;
  private linePath: SVGPathElement;
  private restPath: SVGPathElement | null = null;
  private lineStops: SVGStopElement[] = [];
  private glowStops: SVGStopElement[] = [];
  private points: BorderPoint[] = [];
  private w = 0;
  private h = 0;
  private prevPosition: string | null = null;
  private resizeObserver: ResizeObserver;

  constructor(el: HTMLElement, options: ProximityBorderOptions) {
    this.el = el;
    this.opts = { ...DEFAULTS, ...options };
    const id = `pb-${++uid}`;

    // The overlay must be positioned against the element.
    const position = getComputedStyle(el).position;
    if (position === "static") {
      this.prevPosition = el.style.position;
      el.style.position = "relative";
    }

    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.overflow = "visible";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "5";

    const defs = document.createElementNS(SVGNS, "defs");

    const lineGrad = this.makeGradient(`${id}-line`, this.lineStops);
    const glowGrad = this.makeGradient(`${id}-glow`, this.glowStops);

    const filter = document.createElementNS(SVGNS, "filter");
    filter.setAttribute("id", `${id}-blur`);
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");
    const blur = document.createElementNS(SVGNS, "feGaussianBlur");
    blur.setAttribute("stdDeviation", String(this.opts.glowBlur));
    filter.appendChild(blur);

    defs.append(lineGrad, glowGrad, filter);

    const glowPath = document.createElementNS(SVGNS, "path");
    glowPath.setAttribute("fill", "none");
    glowPath.setAttribute("stroke", `url(#${id}-glow)`);
    glowPath.setAttribute("stroke-width", String(this.opts.lineWidth * 2.5));
    glowPath.setAttribute("filter", `url(#${id}-blur)`);
    glowPath.style.opacity = "0";

    // Resting border: a small, always-visible grey outline the iridescent line
    // grows out of. Shares the (spiking) path so it grows too as the cursor nears.
    let restPath: SVGPathElement | null = null;
    if (this.opts.restStroke) {
      restPath = document.createElementNS(SVGNS, "path");
      restPath.setAttribute("fill", "none");
      restPath.setAttribute("stroke", this.opts.restStroke);
      restPath.setAttribute("stroke-width", String(this.opts.restWidth));
      restPath.setAttribute("stroke-linejoin", "round");
    }

    const linePath = document.createElementNS(SVGNS, "path");
    linePath.setAttribute("fill", "none");
    linePath.setAttribute("stroke", `url(#${id}-line)`);
    linePath.setAttribute("stroke-width", String(this.opts.lineWidth));
    linePath.setAttribute("stroke-linejoin", "round");
    linePath.style.opacity = "0";

    svg.appendChild(defs);
    svg.appendChild(glowPath);
    if (restPath) svg.appendChild(restPath);
    svg.appendChild(linePath);
    el.appendChild(svg);

    this.svg = svg;
    this.glowPath = glowPath;
    this.linePath = linePath;
    this.restPath = restPath;

    this.measure();

    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(el);

    registry.add(this);
    ensureLoop();
  }

  private makeGradient(id: string, stopsOut: SVGStopElement[]): SVGLinearGradientElement {
    const grad = document.createElementNS(SVGNS, "linearGradient");
    grad.setAttribute("id", id);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "1");
    grad.setAttribute("y2", "1");
    for (let i = 0; i < STOP_COUNT; i++) {
      const stop = document.createElementNS(SVGNS, "stop");
      stop.setAttribute("offset", `${(i / (STOP_COUNT - 1)) * 100}%`);
      stop.setAttribute("stop-color", paletteColor(i / STOP_COUNT));
      grad.appendChild(stop);
      stopsOut.push(stop);
    }
    return grad;
  }

  private measure() {
    const rect = this.el.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.svg.setAttribute("viewBox", `0 0 ${this.w} ${this.h}`);
    this.points = buildPoints(this.w, this.h, this.opts.cornerRadius, this.opts.pointCount);
  }

  private setGradient(stops: SVGStopElement[], phase: number, offset: number) {
    for (let i = 0; i < stops.length; i++) {
      stops[i]!.setAttribute("stop-color", paletteColor(phase + offset + i / STOP_COUNT));
    }
  }

  frame(now: number) {
    const {
      proximity,
      strengthPower,
      insideFade,
      angularSpread,
      spikePower,
      maxReach,
      lerp,
      glowOpacity,
      colorSpeed,
      baseOpacity,
    } = this.opts;
    const pts = this.points;
    if (pts.length < 3) return;

    const rect = this.el.getBoundingClientRect();
    const mx = mouse.x - rect.left;
    const my = mouse.y - rect.top;

    // Closest base point to the cursor.
    let minD2 = Infinity;
    let ci = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]!;
      const dx = mx - p.bx;
      const dy = my - p.by;
      const d2 = dx * dx + dy * dy;
      if (d2 < minD2) {
        minD2 = d2;
        ci = i;
      }
    }
    const closestDist = Math.sqrt(minD2);

    let globalStrength = Math.pow(Math.max(0, 1 - closestDist / proximity), strengthPower);
    const inside = mx >= 0 && mx <= this.w && my >= 0 && my <= this.h;
    if (inside) {
      // Fade out as the cursor moves deeper inside the element.
      globalStrength *= Math.max(0, 1 - closestDist / insideFade);
    }

    const tc = pts[ci]!.t;
    for (const p of pts) {
      let ang = Math.abs(p.t - tc);
      if (ang > 0.5) ang = 1 - ang;
      const localT = Math.max(0, 1 - ang / angularSpread);
      const localShape = Math.pow(localT, spikePower);
      const reach = localShape * globalStrength * maxReach;
      const targetX = p.bx + p.nx * reach;
      const targetY = p.by + p.ny * reach;
      p.cx += (targetX - p.cx) * lerp;
      p.cy += (targetY - p.cy) * lerp;
    }

    const d = catmullRomClosed(pts);
    this.linePath.setAttribute("d", d);
    this.glowPath.setAttribute("d", d);
    if (this.restPath) this.restPath.setAttribute("d", d);
    this.linePath.style.opacity = Math.max(baseOpacity, globalStrength).toFixed(3);
    this.glowPath.style.opacity = Math.max(
      baseOpacity * 0.5,
      globalStrength * glowOpacity,
    ).toFixed(3);

    const phase = (now * colorSpeed) % 1;
    this.setGradient(this.lineStops, phase, 0);
    this.setGradient(this.glowStops, phase, 0.15);
  }

  destroy() {
    registry.delete(this);
    this.resizeObserver.disconnect();
    this.svg.remove();
    if (this.prevPosition !== null) this.el.style.position = this.prevPosition;
    maybeStopLoop();
  }
}

/** Attach the proximity border to one element. Returns a detach function. */
export function attachProximityBorder(
  el: HTMLElement,
  options: ProximityBorderOptions = {},
): () => void {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const instance = new ProximityBorder(el, options);
  return () => instance.destroy();
}

/**
 * Auto-apply the proximity border to every element matching `selector`
 * (default: "button"). Returns a function that detaches them all.
 */
export function initProximityBorders(
  selector = "button",
  options: ProximityBorderOptions = {},
): () => void {
  if (typeof document === "undefined") return () => {};
  const detachers: Array<() => void> = [];
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    detachers.push(attachProximityBorder(el, options));
  });
  return () => detachers.forEach((detach) => detach());
}

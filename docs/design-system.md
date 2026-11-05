---
name: adaption-design-system
description: The Adaption design system — its visual language (color tokens, typography, spacing, border radius, shadows, gradients), brand identity, and the light-mode + signature-element rules. Read this AFTER build-web-app and frontend-design when the configured design system is the Adaption design system or the Adaption UI kit, to apply the Adaption look with plain Tailwind + Radix (the Adaption UI kit component library is layered on top of this via the adaption-ui-kit skill).
---

# Adaption Design System

Apply this visual language faithfully using Tailwind CSS utility classes. This skill is the design *language* only — it does NOT require the Adaption UI kit component library (that is layered on top via the `adaption-ui-kit` skill when the configured design system is the kit). Build the components yourself in the Adaption style with plain Tailwind + Radix when only the design system (not the kit) is configured.

## CRITICAL: Light theme required

**The page background MUST be light** (`gray-1`, or `bg-background-primary`). Do NOT use `gray-4`, `gray-5`, or any dark color as the page or card background. Do NOT build a dark-themed interface. The Adaption identity is a clean light mode with dark text on light surfaces. Only use dark backgrounds if the user explicitly writes "dark mode" or "dark theme" in their request.

## Brand identity

Any visual produced for an Adaption application should feel at home inside a modernist, clean, light-mode interface with airy whitespace, thin hairline strokes, soft gradient accents, and a scientific-editorial tone.

- **Light theme is the default.** Primary surfaces read as light: near-white (`#FAFAFA`), lightest-gray (`#F5F5F5`), or very pale tinted washes. Avoid pure black or charcoal fills as the dominant background. Only produce a dark-mode result if the user explicitly asks for dark mode.
- **Color & materiality.** High-contrast relationship between modernist and clean light mode and the use of glassy, gradient-like 3D illustrations. Primary neutrals: near-white (`#FAFAFA`) or lightest-gray (`#F5F5F5`); text is a deep charcoal/black for maximum readability. Apply color sparingly and functionally. Functional accents: minimal sky blue for hover, active states, and to indicate interaction. Soft amber as an attention-grabbing accent to guide user interactions, establish hierarchy, and communicate warnings or pending states without the urgency of red. Light red should signal danger, errors, and high-stakes actions. Pale green should communicate positive states, successful actions, and growth.
- **Composition & tone.** Airy negative space — subjects float with generous padding. Swiss / modernist sensibility: orderly, restrained, no decorative filigree. Scientific-interface cues where they fit (modular cards with rounded corners, ultra-thin gridlines, measurement marks, layered translucent panels). Hairline-weight lines; soft, blurred, lightly-offset drop shadows (never hard/heavy); soft, low-contrast atmospheric gradients (never color blocks).
- **Geometry.** Precise but rounded to help soften. Rounded cards, square data cells, thin rectangular panels, hairline borders by default. Slightly rounded chart containers and heatmap cells. Sharp corner or 100% rounded pill shaped buttons, no in-between.
- **Typography weight.** Only use Adaption’s typeface: “STK Bureau Sans” in Light, Extra-light, or Regular weights. 400 for body/labels/axes/legends/captions; 300 for titles, 500 only for true emphasis. Treat 500 as the max normal weight; avoid bold/extrabold/black.

## Color palette

All colors are Tailwind theme tokens — use them via utility classes (e.g. `bg-gray-1`, `text-blue-4`, `border-red-5`). Hex values are for reference.

**Gray (achromatic):** `gray-0` `#fafafa` (white bg), `gray-1` `#fafafa` (primary light bg), `gray-2` `#c4c4c4` (disabled text / secondary strokes), `gray-3` `#7a7a7a` (secondary text/icons), `gray-4` `#373737` (dark surfaces), `gray-5` `#1a1718` (near-black, primary text), `gray-6` `#F3F2F3` (filled input bg).

**Blue:** `blue-1` `#e7f7ff`, `blue-2` `#c8e9fa`, `blue-3` `#85c9ee`, `blue-4` `#46a5d8`, `blue-5` `#1a84ae`, `blue-6` `#054761`.

**Mint:** `mint-1` `#b6e8e2`, `mint-2` `#7fb5b3`, `mint-3` `#004652`.

**Rose:** `rose-1` `#ffe5fa`, `rose-2` `#df91c6`, `rose-3` `#631d4d`.

**Accents:** `red-1` `#ffebe4`, `red-5` `#f76666`, `orange-1` `#fff0d5`, `orange-5` `#fcb723`, `yellow-1` `#ffffbe`, `yellow-5` `#ffdb11`, `green-1` `#e9ffeb`, `green-5` `#64b48f`.

**Colors are restricted to the design system.** Do not add arbitrary hex, rgb/hsl, CSS color strings, or default Tailwind palette colors (`red-500`, `purple-600`, …). Use Adaption tokens (`red-5`, `blue-4`, `rose-2`, `gray-3`) and their CSS variables (`var(--color-rose-2)`) when a runtime/computed color is required.

### Semantic color tokens

Prefer these over raw palette values for themeable UI: `text-typography-primary` (body text), `text-typography-secondary` (muted/helper), `text-typography-inverse` (on dark), `bg-background-primary` (page bg), `bg-background-secondary` (card/elevated), `bg-background-primary-inverse` / `bg-background-secondary-inverse` (dark surfaces), `border-stroke-primary` / `border-stroke-secondary`, `text-icon-primary` / `text-icon-secondary` / `text-icon-inverse`, `bg-skeleton-primary`. Shadcn-compatible tokens are also available: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring` (+ their `-foreground` companions).

## Typography

The design system uses **"STK Bureau Sans"** (`font-bureau` in Tailwind); default to `font-light` (300). Neo-grotesk / Swiss-inspired sans-serif

| Level | Size | Line height | Tracking |
|-------|------|-------------|----------|
| H1 | 40px | 44px | -2px |
| H2 | 28px | 32px | — |
| H3 | 24px | 32px | — |
| Title | 20px | 24px | — |
| Body | 16px | 20px | — |
| Label | 14px | 16px | — |

Hero headlines may run 60–96px, weight 300, tracking -2%. **Use only `light` (300) by default**; avoid `font-bold` / `font-semibold` and do not upgrade headings to bold during refinement unless the user requests heavy typography.

## Border radius

Default to rounded corners for cards and containers. Prefer a lower radius (`rounded-12` or `rounded-14`) for cards, chart containers, heatmap cells, panels, and tables. Use `rounded-[32px]` / `rounded-[48px]` only for tiny control affordances (inputs, small buttons); `rounded-[12px]` max for dialog content. Use either sharp corners or pill shapes for buttons. Avatars / true circular indicators may be round.

## Shadows

 `shadow-highlight-blue` / `-green` / `-rose` / `-orange` (colored glow highlights)

## Gradient utilities

`bg-gradient-yellow` / `-orange` / `-red` / `-green` / `-blue` / `-rose` / `-mint` (soft vertical `gray-1 → <color>-1 → gray-1` washes) and `bg-gradient-black-blue` (`gray-4 → blue-6`, primary-button background).

## Spacing

Tailwind's default **4px base** scale. Use `gap-*` / `p-*` / `m-*` — never arbitrary pixel values unless the exact value isn't on the scale. Use `gap-*` between children instead of margins; `gap-6`/`gap-8` between page/section blocks, `gap-4` for stacked form fields, `gap-2` for tightly related elements (label + input, icon + text). Thin 0.5px light-gray hairlines separate sections without visual weight ("airy grid").

## Icons & charts

Use `lucide-react` for all icons (never emojis); minimalist line-art, consistent stroke weight. Use `recharts` for charts to break up text-heavy sections; square chart containers, thin axis labels, light legends.

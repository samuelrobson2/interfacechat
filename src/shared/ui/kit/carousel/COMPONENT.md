# Carousel

Scrollable item slideshow based on embla-carousel.

```tsx
import {
  Carousel, CarouselContent, CarouselItem,
  CarouselPrevious, CarouselNext
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Carousel
├── CarouselContent
│   ├── CarouselItem
│   ├── CarouselItem
│   └── CarouselItem
├── CarouselPrevious (← button)
└── CarouselNext (→ button)
```

## Carousel Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal"` \| `"vertical"` | `"horizontal"` | Scroll direction |
| `opts` | `EmblaOptionsType` | — | [Embla carousel options](https://www.embla-carousel.com/api/options/) (`loop`, `align`, `slidesToScroll`, `dragFree`, etc.) |
| `plugins` | `EmblaPluginType[]` | — | [Embla carousel plugins](https://www.embla-carousel.com/plugins/) (Autoplay, AutoScroll, etc.) |
| `setApi` | `(api: CarouselApi) => void` | — | Receive carousel API instance for programmatic control |
| `allowWheelScroll` | `boolean` | `false` | Enable mouse wheel and touchpad scrolling over the carousel. Covers both axes: touchpad swipe along the carousel axis and mouse wheel on the opposite axis (e.g. vertical wheel on a horizontal carousel). |

## CarouselContent Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## CarouselItem Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes. Renders with `role="group"` and `aria-roledescription="slide"`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes (use `basis-*` to control slide width) |

## CarouselPrevious / CarouselNext Props

Extends all props from `Button` component — accepts all `Button` props (`variant`, `size`, `radius`, `disabled`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ButtonProps["variant"]` | `"ghost"` | Button visual style |
| `size` | `ButtonProps["size"]` | `"icon"` | Button size |

## Examples

```tsx
<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

### With wheel / touchpad scroll

```tsx
<Carousel allowWheelScroll opts={{ dragFree: true, align: "start" }}>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </CarouselContent>
</Carousel>
```

import { useState } from "react";
import type { ComponentType } from "react";
import {
  BRAND_ANIMATED_ICONS,
  BuildIconAnimated,
  BuildMarkAnimated,
  SIDEBAR_ANIMATED_ICONS,
  StudioMarkAnimated,
  type AnimatedIconProps,
  type BrandAnimatedIconId,
  type SidebarAnimatedIconId,
} from "@/shared/assets/icons/animated";
import { cn } from "@/shared/lib/css";
import {
  SidebarCard,
  SidebarItem,
  SidebarItemLabel,
  SidebarLayout,
} from "@/shared/ui/kit/sidebar";
import { Text } from "@/shared/ui/kit/text";
import { GalleryPage, Section, Specimen } from "../ui-kit-parts";

const TAB_IDS = Object.keys(SIDEBAR_ANIMATED_ICONS) as SidebarAnimatedIconId[];
const BRAND_TAB_IDS = Object.keys(
  BRAND_ANIMATED_ICONS,
) as BrandAnimatedIconId[];

/** Matches Vision / global sidebar row styling for inactive + active states. */
function rowClassName(isActive: boolean, brand = false) {
  return cn(
    "size-9 w-full justify-center group-data-[expanded=true]/sidebar:size-auto group-data-[expanded=true]/sidebar:justify-start",
    brand && "text-icon-primary",
    isActive
      ? cn(
          "bg-blue-1 text-blue-4",
          "[&_path[stroke]]:stroke-blue-4 [&_path[fill]]:fill-blue-4",
          brand && "[&_circle]:fill-blue-4",
        )
      : cn(
          "bg-transparent hover:bg-gray-6",
          "hover:[&_path[stroke]]:stroke-icon-primary hover:[&_path[fill]]:fill-icon-primary",
          "hover:[&_[data-slot=sidebar-item-label]]:text-typography-primary",
          brand && "hover:[&_circle]:fill-icon-primary",
        ),
  );
}

function AnimatedSidebarDemo() {
  const [activeId, setActiveId] = useState<SidebarAnimatedIconId>("Build");

  return (
    <SidebarLayout expanded className="static">
      <SidebarCard className="w-[220px] p-1.5">
        {TAB_IDS.map((id) => {
          const Icon = SIDEBAR_ANIMATED_ICONS[id] as ComponentType<AnimatedIconProps>;
          const isActive = activeId === id;

          return (
            <SidebarItem
              key={id}
              className={rowClassName(isActive)}
              isActive={isActive}
              asChild
            >
              <button type="button" onClick={() => setActiveId(id)}>
                <Icon active={isActive} />
                <SidebarItemLabel>{id}</SidebarItemLabel>
              </button>
            </SidebarItem>
          );
        })}
      </SidebarCard>
    </SidebarLayout>
  );
}

function AnimatedBrandDemo() {
  const [activeId, setActiveId] = useState<BrandAnimatedIconId>("Build");

  return (
    <SidebarLayout expanded className="static">
      <SidebarCard className="w-[220px] p-1.5">
        {BRAND_TAB_IDS.map((id) => {
          const Icon = BRAND_ANIMATED_ICONS[
            id
          ] as ComponentType<AnimatedIconProps>;
          const isActive = activeId === id;

          return (
            <SidebarItem
              key={id}
              className={rowClassName(isActive, true)}
              isActive={isActive}
              asChild
            >
              <button type="button" onClick={() => setActiveId(id)}>
                <Icon active={isActive} svgClasses="size-[18px] shrink-0" />
                <SidebarItemLabel>{id}</SidebarItemLabel>
              </button>
            </SidebarItem>
          );
        })}
      </SidebarCard>
    </SidebarLayout>
  );
}

function IconPreviewTile({ id }: { id: SidebarAnimatedIconId }) {
  const [active, setActive] = useState(false);
  const Icon = SIDEBAR_ANIMATED_ICONS[id];

  return (
    <button
      type="button"
      onClick={() => {
        setActive(false);
        requestAnimationFrame(() => setActive(true));
      }}
      className="flex flex-col items-center gap-3 rounded-[12px] border border-stroke-secondary/60 p-4 transition-colors hover:border-stroke-primary hover:bg-gray-6"
    >
      <span className="grid size-10 place-items-center rounded-[10px] bg-gray-0">
        <Icon active={active} />
      </span>
      <Text variant="label" className="font-bureau text-center">
        {id}
      </Text>
    </button>
  );
}

function BrandPreviewTile({ id }: { id: BrandAnimatedIconId }) {
  const [active, setActive] = useState(false);
  const Icon = BRAND_ANIMATED_ICONS[id];

  return (
    <button
      type="button"
      onClick={() => {
        setActive(false);
        requestAnimationFrame(() => setActive(true));
      }}
      className="flex flex-col items-center gap-3 rounded-[12px] border border-stroke-secondary/60 p-4 text-icon-primary transition-colors hover:border-stroke-primary hover:bg-gray-6"
    >
      <span className="grid size-10 place-items-center rounded-[10px] bg-gray-0">
        <Icon active={active} svgClasses="size-[18px]" />
      </span>
      <Text variant="label" className="font-bureau text-center">
        {id} mark
      </Text>
    </button>
  );
}

function AnimatedIconsPage() {
  return (
    <GalleryPage>
      <Text variant="body" color="secondary">
        Animated variants of the small black sidebar icons. Each icon plays a
        short one-shot motion when its tab becomes active — pass{" "}
        <span className="font-bureau">active</span> on navigation change. Built
        with framer-motion; respects{" "}
        <span className="font-bureau">prefers-reduced-motion</span>.
      </Text>

      <Section title="Build & Studio brand marks">
        <Text variant="label" color="secondary" className="-mt-2 mb-2">
          The dot-lattice and comet marks from{" "}
          <span className="font-bureau">@/shared/assets/icons/brand</span> —
          used in the Vision sidebar and studio switcher.
        </Text>
        <Specimen
          name="AnimatedBrandDemo"
          from="@/features/ui-kit/pages/animated-icons.page"
          span
        >
          <AnimatedBrandDemo />
        </Specimen>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
          {BRAND_TAB_IDS.map((id) => (
            <BrandPreviewTile key={id} id={id} />
          ))}
        </div>
      </Section>

      <Section title="Sidebar tab demo">
        <Specimen
          name="AnimatedSidebarDemo"
          from="@/features/ui-kit/pages/animated-icons.page"
          span
        >
          <AnimatedSidebarDemo />
        </Specimen>
      </Section>

      <Section title="All animated icons">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TAB_IDS.map((id) => (
            <IconPreviewTile key={id} id={id} />
          ))}
        </div>
        <Text variant="label" color="secondary" className="mt-2">
          Click any tile to replay that icon&apos;s animation.
        </Text>
      </Section>

      <Section title="Usage">
        <div className="grid gap-3 lg:grid-cols-2">
          <Specimen
            name="BuildMarkAnimated"
            from="@/shared/assets/icons/animated"
            copy={`import { BuildMarkAnimated } from "@/shared/assets/icons/animated";

<BuildMarkAnimated active={isActive} svgClasses="size-[18px]" />`}
          >
            <BuildMarkAnimated active svgClasses="size-[18px] text-icon-primary" />
          </Specimen>
          <Specimen
            name="StudioMarkAnimated"
            from="@/shared/assets/icons/animated"
            copy={`import { StudioMarkAnimated } from "@/shared/assets/icons/animated";

<StudioMarkAnimated active={isActive} svgClasses="size-[18px]" />`}
          >
            <StudioMarkAnimated active svgClasses="size-[18px] text-icon-primary" />
          </Specimen>
          <Specimen
            name="BuildIconAnimated"
            from="@/shared/assets/icons/animated"
            copy={`import { BuildIconAnimated } from "@/shared/assets/icons/animated";

<BuildIconAnimated active={isActive} />`}
            span
          >
            <BuildIconAnimated active />
          </Specimen>
        </div>
      </Section>
    </GalleryPage>
  );
}

export const Component = AnimatedIconsPage;

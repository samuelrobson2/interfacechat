import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from ".";
import { Card } from "../card";

const meta: Meta<typeof Carousel> = {
  title: "UI/Kit/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Scroll axis of the carousel",
    },
    allowWheelScroll: {
      control: "boolean",
      description:
        "Enable mouse wheel and touchpad scrolling over the carousel",
    },
  },
  args: {
    orientation: "horizontal",
    allowWheelScroll: false,
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const slides = ["Slide 1", "Slide 2", "Slide 3", "Slide 4", "Slide 5"];

export const Default: Story = {
  render: (args) => (
    <div className="w-80 px-10">
      <Carousel
        orientation={args.orientation}
        allowWheelScroll={args.allowWheelScroll}
      >
        <CarouselContent>
          {slides.map((label) => (
            <CarouselItem key={label}>
              <Card className="h-40 items-center justify-center">
                {label}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="py-12">
      <Carousel
        orientation={args.orientation}
        allowWheelScroll={args.allowWheelScroll}
      >
        <CarouselContent className="h-45">
          {slides.map((label) => (
            <CarouselItem key={label}>
              <Card className="h-40 items-center justify-center">
                {label}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const MultipleItems: Story = {
  render: (args) => (
    <div className="w-[480px] px-10">
      <Carousel
        orientation={args.orientation}
        allowWheelScroll={args.allowWheelScroll}
        opts={{ align: "start", slidesToScroll: 1 }}
      >
        <CarouselContent>
          {slides.map((label) => (
            <CarouselItem key={label} className="basis-1/3">
              <Card className="h-32 items-center justify-center">
                {label}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const WithWheelScroll: Story = {
  args: { allowWheelScroll: true },
  render: (args) => (
    <div className="w-[480px] px-10">
      <Carousel
        orientation={args.orientation}
        allowWheelScroll={args.allowWheelScroll}
        opts={{ dragFree: true, align: "start" }}
      >
        <CarouselContent>
          {slides.map((label) => (
            <CarouselItem key={label} className="basis-1/3">
              <Card className="h-32 items-center justify-center">
                {label}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
};

// Showcase: no navigation buttons
export const WithoutNavigation: Story = {
  render: () => (
    <div className="w-80">
      <Carousel>
        <CarouselContent>
          {slides.map((label) => (
            <CarouselItem key={label}>
              <Card className="h-40 items-center justify-center">
                {label}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
};

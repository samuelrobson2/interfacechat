import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Text } from "../text";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from ".";

const meta: Meta<typeof PaginationLink> = {
  title: "UI/Kit/Pagination",
  component: PaginationLink,
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: ["default", "circle"],
      description: "Shape of pagination items",
    },
  },
  args: {
    shape: "default",
  },
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" shape={args.shape} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive shape={args.shape}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis shape={args.shape} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            10
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" shape={args.shape} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export default meta;
type Story = StoryObj<typeof PaginationLink>;

export const Default: Story = {};

export const Circle: Story = {
  args: { shape: "circle" },
};

export const ActiveMiddlePage: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" shape={args.shape} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis shape={args.shape} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            4
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive shape={args.shape}>
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            6
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis shape={args.shape} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            10
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" shape={args.shape} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const WithDisabledControls: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" shape={args.shape} disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive shape={args.shape}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" shape={args.shape}>
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" shape={args.shape} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const WithPageSelect: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Text as="span" variant="label" color="secondary">
        Page
      </Text>
      <Select defaultValue="1">
        <SelectTrigger variant="outline" size="sm" className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 10 }, (_, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Text as="span" variant="label" color="secondary">
        of 10
      </Text>
    </div>
  ),
};

// Showcase: multiple instances — args not applicable
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <span className="w-24 text-sm text-gray-3">Default</span>
        <div className="flex items-center gap-[5px]">
          <PaginationPrevious href="#" />
          <PaginationLink href="#">1</PaginationLink>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
          <PaginationEllipsis />
          <PaginationNext href="#" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-24 text-sm text-gray-3">Circle</span>
        <div className="flex items-center gap-[5px]">
          <PaginationPrevious href="#" shape="circle" />
          <PaginationLink href="#" shape="circle">
            1
          </PaginationLink>
          <PaginationLink href="#" isActive shape="circle">
            2
          </PaginationLink>
          <PaginationEllipsis shape="circle" />
          <PaginationNext href="#" shape="circle" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-24 text-sm text-gray-3">Disabled</span>
        <div className="flex items-center gap-[5px]">
          <PaginationPrevious href="#" disabled />
          <PaginationNext href="#" disabled />
        </div>
      </div>
    </div>
  ),
};

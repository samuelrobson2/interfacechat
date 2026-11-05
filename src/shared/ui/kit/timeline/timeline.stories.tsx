import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Timeline,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineBody,
  TimelineRow,
  TimelineBar,
  type TimelineColumn,
  type TimelineRowData,
} from ".";

const meta: Meta<typeof Timeline> = {
  title: "UI/Kit/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

// --- Default: 3-month project plan ---

const defaultColumns: TimelineColumn[] = [
  { key: "month-1", label: "This month" },
  { key: "month-2", label: "Next month" },
  { key: "month-3", label: "The month after that" },
];

const defaultRows: TimelineRowData[] = [
  {
    key: "person-1",
    label: "Person 1",
    segments: [
      { key: "p1-1", label: "Project 1", start: 0, end: 25, color: "rose" },
      { key: "p1-2", label: "Project 2", start: 28, end: 72, color: "blue" },
      { key: "p1-3", label: "Project 3", start: 75, end: 100, color: "orange" },
    ],
  },
  {
    key: "person-2",
    label: "Person 2",
    segments: [
      { key: "p2-1", label: "Project 1", start: 5, end: 45, color: "rose" },
    ],
  },
  {
    key: "person-3",
    label: "Person 3",
    segments: [
      { key: "p3-1", label: "Project 2", start: 20, end: 58, color: "blue" },
      { key: "p3-2", label: "Project 3", start: 80, end: 95, color: "green" },
    ],
  },
  {
    key: "person-4",
    label: "Person 4",
    segments: [
      { key: "p4-1", label: "Project 3", start: 55, end: 100, color: "orange" },
    ],
  },
];

export const Default: Story = {
  args: {
    columns: defaultColumns,
    rows: defaultRows,
    className: "w-[660px]",
  },
  render: (args) => (
    <Timeline {...args}>
      <TimelineHeader>
        <TimelineTitle>Timeline</TimelineTitle>
        <TimelineDescription>Description</TimelineDescription>
      </TimelineHeader>
      <TimelineBody />
    </Timeline>
  ),
};

// --- All Colors: Q1 roadmap ---

const quarterColumns: TimelineColumn[] = [
  { key: "jan", label: "January" },
  { key: "feb", label: "February" },
  { key: "mar", label: "March" },
];

const quarterRows: TimelineRowData[] = [
  {
    key: "design",
    label: "Design",
    segments: [{ key: "d1", label: "UI Kit", start: 0, end: 40, color: "rose" }],
  },
  {
    key: "frontend",
    label: "Frontend",
    segments: [
      { key: "f1", label: "Implementation", start: 25, end: 90, color: "blue" },
    ],
  },
  {
    key: "backend",
    label: "Backend",
    segments: [
      { key: "b1", label: "API", start: 0, end: 28, color: "orange" },
      { key: "b2", label: "Integration", start: 38, end: 75, color: "green" },
    ],
  },
  {
    key: "qa",
    label: "QA",
    segments: [{ key: "q1", label: "Testing", start: 60, end: 100, color: "mint" }],
  },
  {
    key: "devops",
    label: "DevOps",
    segments: [{ key: "do1", label: "Deploy", start: 85, end: 100, color: "yellow" }],
  },
];

// Showcase: multiple instances — args not applicable
export const WithAllColors: Story = {
  render: () => (
    <Timeline columns={quarterColumns} rows={quarterRows} className="w-[660px]">
      <TimelineHeader>
        <TimelineTitle>Project Plan</TimelineTitle>
        <TimelineDescription>Q1 2026 roadmap</TimelineDescription>
      </TimelineHeader>
      <TimelineBody />
    </Timeline>
  ),
};

// --- Compact: 2-week sprint ---

const sprintColumns: TimelineColumn[] = [
  { key: "week-1", label: "Week 1" },
  { key: "week-2", label: "Week 2" },
];

const sprintRows: TimelineRowData[] = [
  {
    key: "task-a",
    label: "Task A",
    segments: [
      { key: "a1", label: "Development", start: 0, end: 65, color: "blue" },
    ],
  },
  {
    key: "task-b",
    label: "Task B",
    segments: [
      { key: "b1", label: "Review", start: 40, end: 85, color: "orange" },
    ],
  },
  {
    key: "task-c",
    label: "Task C",
    segments: [
      { key: "c1", label: "Bugfix", start: 10, end: 30, color: "red" },
      { key: "c2", label: "Deploy", start: 75, end: 100, color: "green" },
    ],
  },
];

export const Compact: Story = {
  args: {
    columns: sprintColumns,
    rows: sprintRows,
    className: "w-[500px]",
  },
  render: (args) => (
    <Timeline {...args}>
      <TimelineHeader>
        <TimelineTitle>Sprint</TimelineTitle>
      </TimelineHeader>
      <TimelineBody />
    </Timeline>
  ),
};

// --- Multi-span: 6-week release cycle with overlapping phases ---

const longColumns: TimelineColumn[] = [
  { key: "w1", label: "Week 1" },
  { key: "w2", label: "Week 2" },
  { key: "w3", label: "Week 3" },
  { key: "w4", label: "Week 4" },
  { key: "w5", label: "Week 5" },
  { key: "w6", label: "Week 6" },
];

const longRows: TimelineRowData[] = [
  {
    key: "research",
    label: "Research",
    segments: [
      { key: "r1", label: "Discovery", start: 0, end: 28, color: "rose" },
    ],
  },
  {
    key: "design",
    label: "Design",
    segments: [
      { key: "d1", label: "Wireframes & UI", start: 12, end: 48, color: "blue" },
    ],
  },
  {
    key: "engineering",
    label: "Engineering",
    segments: [
      { key: "e1", label: "Build", start: 30, end: 78, color: "green" },
    ],
  },
  {
    key: "qa",
    label: "QA",
    segments: [
      { key: "q1", label: "Unit tests", start: 42, end: 62, color: "mint" },
      { key: "q2", label: "E2E", start: 68, end: 92, color: "orange" },
    ],
  },
  {
    key: "launch",
    label: "Launch",
    segments: [
      { key: "l1", label: "Release", start: 88, end: 100, color: "red" },
    ],
  },
];

// Showcase: overlapping phases with percentage ranges
export const MultiSpan: Story = {
  render: () => (
    <Timeline columns={longColumns} rows={longRows} className="w-[800px]">
      <TimelineHeader>
        <TimelineTitle>Release Cycle</TimelineTitle>
        <TimelineDescription>6-week cadence</TimelineDescription>
      </TimelineHeader>
      <TimelineBody />
    </Timeline>
  ),
};

// --- Custom row rendering via render callback ---

// Showcase: custom per-row rendering
export const CustomRowRender: Story = {
  render: () => (
    <Timeline columns={quarterColumns} rows={quarterRows} className="w-[660px]">
      <TimelineHeader>
        <TimelineTitle>Custom Rows</TimelineTitle>
        <TimelineDescription>
          Render callback for per-row customisation
        </TimelineDescription>
      </TimelineHeader>
      <TimelineBody>
        {(row, index) => (
          <TimelineRow
            label={`${index + 1}. ${row.label}`}
            className={index % 2 === 0 ? "bg-gray-1/30 rounded-[8px]" : ""}
          >
            {row.segments.map((seg) => (
              <TimelineBar
                key={seg.key}
                start={seg.start}
                end={seg.end}
                color={seg.color}
              >
                {seg.label}
              </TimelineBar>
            ))}
          </TimelineRow>
        )}
      </TimelineBody>
    </Timeline>
  ),
};

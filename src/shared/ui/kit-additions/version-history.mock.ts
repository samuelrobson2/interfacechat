export type VersionHistoryEntry = {
  id: string;
  title: string;
  author: "AI edit" | "Your edit";
  timeLabel: string;
  isCurrent?: boolean;
};

export const versionHistoryMock: VersionHistoryEntry[] = [
  {
    id: "v-8",
    title:
      'On program, data-cid="c16": Change Lorem Ipsum dolor sit amet consectetur in max 2 lines...',
    author: "AI edit",
    timeLabel: "current",
    isCurrent: true,
  },
  {
    id: "v-7",
    title: "Moved component",
    author: "Your edit",
    timeLabel: "Today, 2:32PM",
  },
  {
    id: "v-6",
    title: "Updated hero copy",
    author: "AI edit",
    timeLabel: "Today, 1:12PM",
  },
  {
    id: "v-5",
    title: "Moved component",
    author: "Your edit",
    timeLabel: "July 1 2:32PM",
  },
  {
    id: "v-4",
    title: "Recolored primary button",
    author: "Your edit",
    timeLabel: "July 1 1:04PM",
  },
  {
    id: "v-3",
    title: "Generated pricing section",
    author: "AI edit",
    timeLabel: "June 30 6:20PM",
  },
  {
    id: "v-2",
    title: "Moved component",
    author: "Your edit",
    timeLabel: "June 30 5:58PM",
  },
  {
    id: "v-1",
    title: "Initial interface",
    author: "AI edit",
    timeLabel: "June 30 5:40PM",
  },
];

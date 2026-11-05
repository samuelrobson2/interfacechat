# Example: Project Management Board (Linear-style)

A sprint tracker mini-app with kanban board, list view, team members, and progress indicators.

## Components Used

`Card` (`default` for sections, `filled` for task cards — consistent within each role), `CardContent`, `Text`, `TruncatedText`, `Badge` (`sm`, `default` / `ghost` / `neutral` / `accent`, `radius="square"`), `Button` (`blue` / `ghost` / `link-destructive`, `size="40"` / `icon-sm` / `icon-md"`), `Tabs` / `TabsList` (`variant="solid"`, `color="blue"`) / `TabsTrigger` / `TabsContent`, `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell`, `Progress` (`blue`) / `ProgressRow`, `CircularProgress` (`size="md"`, `color="blue"`), `Avatar` / `AvatarImage` / `AvatarFallback`, `InteractiveBadge` (`default` / `sm`), `Switch` (`variant="filled"`, `size="sm"`), `Separator`.

## Key Patterns

- **Card variant consistency**: `default` (neumorphic) for all section/metric cards, `filled` for all task cards in the board — consistent within each role
- **Kanban columns** as `grid-cols-4` with status-grouped task cards
- **CircularProgress** for sprint completion metric
- **ProgressRow** + **Progress** with consistent `blue` color for task breakdown
- **Avatar** with `AvatarFallback` for team members
- **Badge diversity**: all 4 colors (`default` / `ghost` / `neutral` / `accent`), `radius="square"` for labels, conditional className for status/priority colors
- **Tabs** with `variant="solid"` and `color="blue"` for Board/List toggle (icons inside triggers)
- **InteractiveBadge** as quick filters ("Urgent", "Due soon")
- **Switch** (`variant="filled"`, `size="sm"`) for notification toggle
- **Button diversity**: `blue` for main CTA, `ghost` for icon buttons (`icon-sm`, `icon-md`), dashed ghost for "Add task", `link-destructive` for delete action
- `hover:shadow-highlight-blue` for interactive card hover

## Code

```tsx
import { useState } from "react";
import {
  Text, TruncatedText, Badge, Button, Card, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Progress, ProgressRow, CircularProgress,
  Avatar, AvatarImage, AvatarFallback,
  InteractiveBadge, Switch, Separator,
} from "@adaptionlabs/ui-kit";
import {
  Plus, Filter, MoreVertical, LayoutGrid, List, CalendarDays,
  AlertCircle, CheckCircle2, Circle, Loader2, Trash2, Bell,
} from "lucide-react";

type TaskStatus = "done" | "in_progress" | "todo" | "backlog";
type TaskPriority = "urgent" | "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  label: string;
  dueDate: string;
}

const tasks: Task[] = [
  { id: "PRJ-101", title: "Design new onboarding flow", status: "in_progress",
    priority: "high", assignee: "Alice", label: "Design", dueDate: "Apr 15" },
  { id: "PRJ-102", title: "Implement authentication API", status: "done",
    priority: "urgent", assignee: "Bob", label: "Backend", dueDate: "Apr 10" },
  { id: "PRJ-103", title: "Set up CI/CD pipeline", status: "done",
    priority: "medium", assignee: "Charlie", label: "DevOps", dueDate: "Apr 12" },
  { id: "PRJ-104", title: "Create dashboard analytics page", status: "in_progress",
    priority: "high", assignee: "Diana", label: "Frontend", dueDate: "Apr 18" },
  { id: "PRJ-105", title: "Write API documentation", status: "todo",
    priority: "medium", assignee: "Eve", label: "Docs", dueDate: "Apr 20" },
  // ... more tasks
];

const teamMembers = [
  { name: "Alice", avatar: "https://i.pravatar.cc/80?u=alice", tasks: 3 },
  { name: "Bob", avatar: "https://i.pravatar.cc/80?u=bob", tasks: 2 },
  { name: "Charlie", avatar: "https://i.pravatar.cc/80?u=charlie", tasks: 2 },
  { name: "Diana", avatar: "https://i.pravatar.cc/80?u=diana", tasks: 2 },
];

// Status icons mapped per status
const statusIcons: Record<TaskStatus, React.ReactNode> = {
  done: <CheckCircle2 className="size-4 text-green-5" />,
  in_progress: <Loader2 className="size-4 text-blue-5" />,
  todo: <Circle className="size-4 text-gray-3" />,
  backlog: <Circle className="size-4 text-gray-2" />,
};

// Badge config — shows all 4 badge colors
const statusConfig: Record<TaskStatus, {
  label: string;
  badgeColor: "default" | "ghost" | "neutral" | "accent";
  className: string;
}> = {
  done: { label: "Done", badgeColor: "default", className: "bg-green-1 text-green-5 [--hairline-color:var(--color-green-5)]" },
  in_progress: { label: "In Progress", badgeColor: "default", className: "bg-blue-1 text-blue-5 [--hairline-color:var(--color-blue-5)]" },
  todo: { label: "To Do", badgeColor: "neutral", className: "" },
  backlog: { label: "Backlog", badgeColor: "ghost", className: "" },
};

const priorityConfig: Record<TaskPriority, {
  label: string;
  badgeColor: "default" | "ghost" | "neutral" | "accent";
  className: string;
}> = {
  urgent: { label: "Urgent", badgeColor: "default", className: "bg-red-1 text-red-5 [--hairline-color:var(--color-red-5)]" },
  high: { label: "High", badgeColor: "default", className: "bg-orange-1 text-orange-5 [--hairline-color:var(--color-orange-5)]" },
  medium: { label: "Medium", badgeColor: "neutral", className: "" },
  low: { label: "Low", badgeColor: "ghost", className: "" },
};

const ProjectBoard = () => {
  const [activeTab, setActiveTab] = useState("board");
  const [notificationsOn, setNotificationsOn] = useState(true);

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const sprintProgress = Math.round((doneCount / tasks.length) * 100);

  const groupedByStatus: Record<TaskStatus, Task[]> = {
    backlog: tasks.filter((t) => t.status === "backlog"),
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-background-primary min-h-screen">
      {/* Header — primary button, ghost icon buttons, Switch toggle */}
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Text variant="h2" weight="bold">Sprint 24</Text>
            <Badge size="sm" color="default"
              className="bg-blue-1 text-blue-5 [--hairline-color:var(--color-blue-5)]">Active</Badge>
          </div>
          <Text variant="body" color="secondary">
            Apr 1 — Apr 14 · {tasks.length} issues
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-icon-secondary" />
            <Switch variant="filled" size="sm"
              checked={notificationsOn} onCheckedChange={setNotificationsOn} />
          </div>
          <Button variant="ghost" size="icon-md" aria-label="Filter">
            <Filter className="size-5" />
          </Button>
          <Button variant="blue" size="40">
            <Plus className="size-4" />
            New Issue
          </Button>
        </div>
      </header>

      {/* Metrics — three different Card variants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" spacing="none">
          <CardContent className="flex items-center gap-4 p-4">
            <CircularProgress value={sprintProgress} size="md" color="blue" />
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="title" weight="bold">{sprintProgress}%</Text>
              <Text variant="label" color="secondary">Sprint progress</Text>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" spacing="none">
          <CardContent className="flex flex-col gap-3 p-4">
            <Text variant="label" color="secondary">Task Breakdown</Text>
            <div className="flex flex-col gap-2">
              <ProgressRow label="Done"
                value={Math.round((doneCount / tasks.length) * 100)} color="blue">
                <Progress value={Math.round((doneCount / tasks.length) * 100)} color="blue" />
              </ProgressRow>
              <ProgressRow label="In Progress"
                value={Math.round((inProgressCount / tasks.length) * 100)} color="blue">
                <Progress value={Math.round((inProgressCount / tasks.length) * 100)} color="blue" />
              </ProgressRow>
              <ProgressRow label="To Do"
                value={Math.round((todoCount / tasks.length) * 100)} color="blue">
                <Progress value={Math.round((todoCount / tasks.length) * 100)} color="blue" />
              </ProgressRow>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" spacing="none">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Text variant="label" color="secondary">Team</Text>
              <Badge size="sm" color="neutral" radius="square">
                {teamMembers.length} members
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex items-center gap-2">
                  <Avatar className="size-6 shrink-0">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback userName={member.name} />
                  </Avatar>
                  <Text variant="label" weight="regular" as="span">{member.name}</Text>
                  <Badge size="sm" color="ghost" className="ml-auto">
                    {member.tasks}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs — variant="solid" color="blue" + InteractiveBadge quick filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList variant="solid" color="blue" size="md">
            <TabsTrigger value="board">
              <LayoutGrid className="size-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="size-4" />
              List
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <InteractiveBadge size="sm" color="default">
              <AlertCircle className="size-3.5" />
              Urgent
            </InteractiveBadge>
            <InteractiveBadge size="sm" color="default">
              <CalendarDays className="size-3.5" />
              Due soon
            </InteractiveBadge>
          </div>
        </div>

        {/* Board view — Kanban columns */}
        <TabsContent value="board" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["backlog", "todo", "in_progress", "done"] as TaskStatus[]).map((status) => (
              <div key={status} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {statusIcons[status]}
                  <Text variant="label" weight="regular">
                    {statusConfig[status].label}
                  </Text>
                  <Badge size="sm" color="neutral">
                    {groupedByStatus[status].length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {groupedByStatus[status].map((task) => (
                    <Card key={task.id} variant="filled" spacing="none"
                      className="cursor-pointer hover:shadow-highlight-blue transition-shadow">
                      <CardContent className="flex flex-col gap-2 p-3">
                        <div className="flex items-center justify-between">
                          <Text variant="label" color="secondary">{task.id}</Text>
                          <Button variant="ghost" size="icon-sm" aria-label="Task menu">
                            <MoreVertical className="size-4" />
                          </Button>
                        </div>
                        <TruncatedText variant="body" weight="regular">
                          {task.title}
                        </TruncatedText>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge size="sm"
                            color={priorityConfig[task.priority].badgeColor}
                            className={priorityConfig[task.priority].className}>
                            {priorityConfig[task.priority].label}
                          </Badge>
                          <Badge size="sm" color="neutral" radius="square">
                            {task.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="size-3.5 text-icon-secondary" />
                            <Text variant="label" color="secondary">{task.dueDate}</Text>
                          </div>
                          <Avatar className="size-5 shrink-0">
                            <AvatarFallback userName={task.assignee} />
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="ghost" size="40"
                    className="w-full border border-dashed border-stroke-secondary">
                    <Plus className="size-4" />
                    Add task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* List view — Table + destructive link button */}
        <TabsContent value="list" className="pt-4">
          <Card variant="default" spacing="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="cursor-pointer">
                    <TableCell>{statusIcons[task.status]}</TableCell>
                    <TableCell>
                      <Text variant="label" color="secondary">{task.id}</Text>
                    </TableCell>
                    <TableCell>
                      <TruncatedText variant="body" weight="regular"
                        className="max-w-[280px]">{task.title}</TruncatedText>
                    </TableCell>
                    <TableCell>
                      <Badge size="sm" color={statusConfig[task.status].badgeColor}
                        className={statusConfig[task.status].className}>
                        {statusConfig[task.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge size="sm" color={priorityConfig[task.priority].badgeColor}
                        className={priorityConfig[task.priority].className}>
                        {priorityConfig[task.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5 shrink-0">
                          <AvatarFallback userName={task.assignee} />
                        </Avatar>
                        <Text variant="label">{task.assignee}</Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Text variant="label" color="secondary">{task.dueDate}</Text>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete task">
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="flex justify-end mt-4">
            <Button variant="link-destructive" size="40">
              <Trash2 className="size-4" />
              Delete completed tasks
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

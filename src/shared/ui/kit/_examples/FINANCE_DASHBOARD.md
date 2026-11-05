# Example: Finance Dashboard (Brex-style)

A financial overview mini-app with KPI cards, charts, a transactions table, and budget trackers.

## Components Used

`Card` (`outlined` — consistent across the entire app), `CardContent`, `CardHeader`, `CardTitle`, `CardAction`, `CardFooter`, `Text`, `TruncatedText`, `Badge` (`sm` + `default` / `ghost` / `neutral`, `radius="square"`), `Button` (`primary` / `secondary` / `link` / `ghost` / `blue`, `size="40"` / `icon-sm`, `radius="rounded"`), `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell`, `Progress` (`blue`), `ChartContainer` + Recharts (`AreaChart`, `BarChart`), `Separator`, `Tooltip`.

## Key Patterns

- **KPI card** as a reusable sub-component with typed props — all use `Card variant="outlined"` for visual consistency
- **CardAction** with `Badge` and `Button` in headers
- **CardFooter** with centered action button (`radius="rounded"`)
- `grid` layout for responsive card rows (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- `ChartConfig` with design system CSS variables (`var(--color-blue-5)`, `var(--color-red-5)`)
- Conditional text color via `className` with design tokens (`text-green-5`)
- `Progress` bar with consistent `blue` color
- **Button variant diversity**: `primary` for main CTA, `secondary` for export, `link` for "View all", `ghost` for icon buttons, `blue` for full-width budget CTA
- **Tooltip** on icon button for notifications

## Code

```tsx
import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis,
} from "recharts";
import {
  Text, Badge, Button, Card, CardContent, CardHeader, CardTitle,
  CardAction, CardFooter, Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, Progress, ChartContainer, ChartTooltip,
  ChartTooltipContent, Separator, Tooltip, TooltipTrigger,
  TooltipContent, TooltipProvider, type ChartConfig,
} from "@adaptionlabs/ui-kit";
import {
  TrendingUp, CreditCard, DollarSign, Clock, ArrowUpRight,
  ArrowDownRight, Download, Plus, ArrowRight, Bell, Settings, Eye,
} from "lucide-react";

// --- Data ---
const revenueData = [
  { month: "Jan", revenue: 32400, expenses: 21800 },
  { month: "Feb", revenue: 38200, expenses: 24100 },
  { month: "Mar", revenue: 35700, expenses: 22900 },
  { month: "Apr", revenue: 47100, expenses: 28400 },
  { month: "May", revenue: 42800, expenses: 26700 },
  { month: "Jun", revenue: 51300, expenses: 31200 },
];

const transactions = [
  { id: 1, merchant: "AWS Cloud Services", category: "Software", amount: -4250.00, date: "Apr 12", status: "completed" },
  { id: 2, merchant: "Google Ads", category: "Marketing", amount: -2180.00, date: "Apr 11", status: "completed" },
  { id: 3, merchant: "WeWork Membership", category: "Office", amount: -1200.00, date: "Apr 10", status: "pending" },
  { id: 4, merchant: "Client Payment — Acme Corp", category: "Income", amount: 15000.00, date: "Apr 08", status: "completed" },
];

const budgets = [
  { name: "Software & Tools", spent: 12400, total: 15000 },
  { name: "Marketing", spent: 8200, total: 10000 },
  { name: "Travel & Transport", spent: 5600, total: 8000 },
  { name: "Office & Supplies", spent: 4100, total: 5000 },
];

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
  expenses: { label: "Expenses", color: "var(--color-red-5)" },
};

// --- Reusable KPI Card (shows Card variant diversity) ---
interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const KpiCard = ({ title, value, change, trend, icon }: KpiCardProps) => (
  <Card variant="outlined" spacing="none">
    <CardContent className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <Text variant="label" color="secondary">{title}</Text>
        <div className="size-8 shrink-0 rounded-[4px] bg-blue-1 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <Text variant="h2" weight="bold">{value}</Text>
      <div className="flex items-center gap-1">
        {trend === "up"
          ? <ArrowUpRight className="size-4 text-green-5" />
          : <ArrowDownRight className="size-4 text-red-5" />}
        <Text variant="label" color="none" as="span"
          className={trend === "up" ? "text-green-5" : "text-red-5"}>
          {change}
        </Text>
        <Text variant="label" color="secondary" as="span">vs last month</Text>
      </div>
    </CardContent>
  </Card>
);

// --- Main Dashboard ---
const FinanceDashboard = () => (
  <div className="flex flex-col gap-6 p-6 bg-background-primary min-h-screen">
    {/* Header with diverse button variants */}
    <header className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <Text variant="h2" weight="bold">Finance Dashboard</Text>
        <Text variant="body" color="secondary">Overview of your company finances</Text>
      </div>
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                <Bell className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button variant="secondary" size="40">
          <Download className="size-4" />
          Export
        </Button>
        <Button variant="primary" size="40">
          <Plus className="size-4" />
          Add Expense
        </Button>
      </div>
    </header>

    {/* KPIs — each card uses a different variant */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="Total Revenue" value="$352.6K" change="+12.5%" trend="up"
        icon={<TrendingUp className="size-5 text-blue-5" />} />
      <KpiCard title="Total Expenses" value="$218.0K" change="+8.2%" trend="up"
        icon={<CreditCard className="size-5 text-blue-5" />} />
      <KpiCard title="Net Profit" value="$134.6K" change="+18.3%" trend="up"
        icon={<DollarSign className="size-5 text-blue-5" />} />
      <KpiCard title="Pending" value="$23.4K" change="-5.1%" trend="down"
        icon={<Clock className="size-5 text-blue-5" />} />
    </div>

    {/* Chart area — Card variant="outlined" with CardAction */}
    <Card variant="outlined" spacing="none">
      <CardHeader className="p-4">
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardAction>
          <Badge size="sm" color="ghost">Last 6 months</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)"
              fill="var(--color-revenue)" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke="var(--color-expenses)"
              fill="var(--color-expenses)" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>

    {/* Transactions — Card variant="outlined" with link button + CardFooter */}
    <Card variant="outlined" spacing="none">
      <CardHeader className="p-4">
        <CardTitle>Recent Transactions</CardTitle>
        <CardAction>
          <Button variant="link" size="40">View all<ArrowRight className="size-4" /></Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell><Text variant="body" weight="regular">{tx.merchant}</Text></TableCell>
                <TableCell>
                  <Badge size="sm" radius="square" color="neutral">{tx.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge size="sm"
                    color={tx.status === "completed" ? "default" : "ghost"}
                    className={tx.status === "completed" ? "bg-green-1 text-green-5 [--hairline-color:var(--color-green-5)]" : ""}>
                    {tx.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Text variant="body" weight="regular" color="none" as="span"
                    className={tx.amount > 0 ? "text-green-5" : "text-typography-primary"}>
                    {tx.amount > 0 ? "+" : ""}
                    ${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="p-4 justify-center">
        <Button variant="secondary" size="40" radius="rounded">Load more transactions</Button>
      </CardFooter>
    </Card>

    {/* Budget — Progress with all color variants + blue button */}
    <Card variant="outlined" spacing="none">
      <CardHeader className="p-4">
        <CardTitle>Budget Tracking</CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <Settings className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-4 pt-0">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.total) * 100);
          return (
            <div key={b.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Text variant="label" weight="regular">{b.name}</Text>
                <Text variant="label" color="secondary">
                  ${b.spent.toLocaleString()} / ${b.total.toLocaleString()}
                </Text>
              </div>
              <Progress value={pct} color="blue" />
            </div>
          );
        })}
      </CardContent>
      <Separator color="secondary" />
      <CardFooter className="p-4">
        <Button variant="blue" size="48" className="w-full">
          <Eye className="size-4" />
          View All Budgets
        </Button>
      </CardFooter>
    </Card>
  </div>
);
```

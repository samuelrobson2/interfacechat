import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  CircularProgress,
  Input,
  InteractiveBadge,
  Progress,
  ProgressRow,
  Separator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TruncatedText,
  type ChartConfig
} from "@/shared/ui/kit";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Filter,
  Heart,
  LayoutGrid,
  List,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Trash2,
  TrendingUp,
  User
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const meta: Meta = {
  title: "Examples/Mini Apps",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────
// 1. FINANCE DASHBOARD (Brex-style)
// ─────────────────────────────────────────────

const revenueData = [
  { month: "Jan", revenue: 32400, expenses: 21800 },
  { month: "Feb", revenue: 38200, expenses: 24100 },
  { month: "Mar", revenue: 35700, expenses: 22900 },
  { month: "Apr", revenue: 47100, expenses: 28400 },
  { month: "May", revenue: 42800, expenses: 26700 },
  { month: "Jun", revenue: 51300, expenses: 31200 },
  { month: "Jul", revenue: 48900, expenses: 29800 },
  { month: "Aug", revenue: 56200, expenses: 33100 },
];

const spendingByCategory = [
  { category: "Software", amount: 12400 },
  { category: "Marketing", amount: 8200 },
  { category: "Travel", amount: 5600 },
  { category: "Office", amount: 4100 },
  { category: "Meals", amount: 2800 },
];

const recentTransactions = [
  { id: 1, merchant: "AWS Cloud Services", category: "Software", amount: -4250.0, date: "Apr 12", status: "completed" as const },
  { id: 2, merchant: "Google Ads", category: "Marketing", amount: -2180.0, date: "Apr 11", status: "completed" as const },
  { id: 3, merchant: "WeWork Membership", category: "Office", amount: -1200.0, date: "Apr 10", status: "pending" as const },
  { id: 4, merchant: "Delta Airlines", category: "Travel", amount: -890.0, date: "Apr 09", status: "completed" as const },
  { id: 5, merchant: "Client Payment — Acme Corp", category: "Income", amount: 15000.0, date: "Apr 08", status: "completed" as const },
];

const budgets = [
  { name: "Software & Tools", spent: 12400, total: 15000 },
  { name: "Marketing", spent: 8200, total: 10000 },
  { name: "Travel & Transport", spent: 5600, total: 8000 },
  { name: "Office & Supplies", spent: 4100, total: 5000 },
];

const revenueChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
  expenses: { label: "Expenses", color: "var(--color-red-5)" },
};

const spendingChartConfig: ChartConfig = {
  amount: { label: "Amount", color: "var(--color-blue-4)" },
};

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
        {trend === "up" ? (
          <ArrowUpRight className="size-4 text-green-5" />
        ) : (
          <ArrowDownRight className="size-4 text-red-5" />
        )}
        <Text
          variant="label"
          color="none"
          as="span"
          className={trend === "up" ? "text-green-5" : "text-red-5"}
        >
          {change}
        </Text>
        <Text variant="label" color="secondary" as="span">vs last month</Text>
      </div>
    </CardContent>
  </Card>
);

const FinanceDashboard = () => (
  <div className="flex flex-col gap-6 p-6 bg-background-primary min-h-screen">
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

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Revenue"
        value="$352.6K"
        change="+12.5%"
        trend="up"
        icon={<TrendingUp className="size-5 text-blue-5" />}
      />
      <KpiCard
        title="Total Expenses"
        value="$218.0K"
        change="+8.2%"
        trend="up"
        icon={<CreditCard className="size-5 text-blue-5" />}
      />
      <KpiCard
        title="Net Profit"
        value="$134.6K"
        change="+18.3%"
        trend="up"
        icon={<DollarSign className="size-5 text-blue-5" />}
      />
      <KpiCard
        title="Pending Invoices"
        value="$23.4K"
        change="-5.1%"
        trend="down"
        icon={<Clock className="size-5 text-blue-5" />}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card variant="outlined" spacing="none" className="lg:col-span-2">
        <CardHeader className="p-4">
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardAction>
            <Badge size="sm" color="ghost">Last 8 months</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ChartContainer config={revenueChartConfig} className="h-64 w-full">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-expenses)"
                fill="var(--color-expenses)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card variant="outlined" spacing="none">
        <CardHeader className="p-4">
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ChartContainer config={spendingChartConfig} className="h-64 w-full">
            <BarChart data={spendingByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card variant="outlined" spacing="none" className="lg:col-span-2">
        <CardHeader className="p-4 justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <CardAction>
            <Button variant="link" size="40">
              View all
              <ArrowRight className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Text variant="body" weight="regular">{tx.merchant}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge size="sm" radius="square" color="neutral">{tx.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Text variant="body" color="secondary">{tx.date}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      color={tx.status === "completed" ? "default" : "ghost"}
                      className={tx.status === "completed" ? "bg-green-1 text-green-5 [--hairline-color:var(--color-green-5)]" : ""}
                    >
                      {tx.status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Text
                      variant="body"
                      weight="regular"
                      color="none"
                      as="span"
                      className={tx.amount > 0 ? "text-green-5" : "text-typography-primary"}
                    >
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="p-4 justify-center">
          <Button variant="secondary" size="40" radius="rounded">
            Load more transactions
          </Button>
        </CardFooter>
      </Card>

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
  </div>
);

// Showcase: multiple instances — args not applicable
export const FinanceDashboardStory: Story = {
  name: "Finance Dashboard",
  render: () => <FinanceDashboard />,
};

// ─────────────────────────────────────────────
// 2. SHOPPING UI (Uniqlo-style)
// ─────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  colors: string[];
  rating: number;
  reviews: number;
  badge?: string;
  sizes: string[];
}

const products: Product[] = [
  {
    id: 1,
    name: "Ultra Light Down Jacket",
    price: 79.9,
    originalPrice: 99.9,
    image: "https://picsum.photos/seed/jacket-1/400/534",
    colors: ["bg-gray-5", "bg-blue-5", "bg-red-5"],
    rating: 4.5,
    reviews: 234,
    badge: "Sale",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "Merino Wool Crew Neck Sweater",
    price: 49.9,
    image: "https://picsum.photos/seed/sweater-2/400/534",
    colors: ["bg-gray-4", "bg-mint-3", "bg-gray-2"],
    rating: 4.8,
    reviews: 189,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "Stretch Slim Fit Chino Pants",
    price: 39.9,
    image: "https://picsum.photos/seed/pants-3/400/534",
    colors: ["bg-gray-5", "bg-blue-6"],
    rating: 4.3,
    reviews: 156,
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    id: 4,
    name: "AIRism Cotton Oversized T-Shirt",
    price: 19.9,
    image: "https://picsum.photos/seed/tshirt-4/400/534",
    colors: ["bg-gray-0", "bg-gray-5", "bg-blue-4"],
    rating: 4.6,
    reviews: 412,
    badge: "New",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: 5,
    name: "Relaxed Fit Oxford Shirt",
    price: 34.9,
    image: "https://picsum.photos/seed/shirt-5/400/534",
    colors: ["bg-blue-2", "bg-gray-0", "bg-rose-2"],
    rating: 4.4,
    reviews: 98,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 6,
    name: "Ultra Stretch Active Jogger Pants",
    price: 44.9,
    originalPrice: 59.9,
    image: "https://picsum.photos/seed/jogger-6/400/534",
    colors: ["bg-gray-5", "bg-gray-4"],
    rating: 4.7,
    reviews: 321,
    badge: "Sale",
    sizes: ["S", "M", "L", "XL"],
  },
];

const categories = ["All", "Outerwear", "Tops", "Bottoms", "Accessories"];

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`size-3.5 ${i < Math.floor(rating) ? "fill-yellow-5 text-yellow-5" : "text-gray-2"}`}
      />
    ))}
  </div>
);

const ProductCard = ({ product }: { product: Product }) => (
  <Card variant="ghost" spacing="none" className="group cursor-pointer">
    <div className="relative overflow-hidden rounded-[4px]">
      <CardImage
        src={product.image}
        alt={product.name}
        ratio="portrait"
        className="transition-transform duration-300 group-hover:scale-105"
      />
      {product.badge && (
        <div className="absolute top-2 left-2">
          <Badge
            size="sm"
            color="default"
            className={product.badge === "Sale" ? "bg-red-1 text-red-5 [--hairline-color:var(--color-red-5)]" : "bg-blue-1 text-blue-5 [--hairline-color:var(--color-blue-5)]"}
          >
            {product.badge}
          </Badge>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Add to wishlist"
        className="absolute top-2 right-2 bg-gray-0/80"
      >
        <Heart className="size-4" />
      </Button>
    </div>
    <CardContent className="flex flex-col gap-1.5 pt-3">
      <TruncatedText variant="body" weight="regular">{product.name}</TruncatedText>
      <div className="flex items-center gap-2">
        <Text variant="body" weight="bold" as="span">
          ${product.price.toFixed(2)}
        </Text>
        {product.originalPrice && (
          <Text variant="label" color="secondary" as="span" className="line-through">
            ${product.originalPrice.toFixed(2)}
          </Text>
        )}
      </div>
      <div className="flex items-center gap-2">
        <RatingStars rating={product.rating} />
        <Text variant="label" color="secondary" as="span">({product.reviews})</Text>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        {product.colors.map((color, i) => (
          <div
            key={i}
            className={`size-4 rounded-full border border-stroke-secondary ${color}`}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

const FeaturedProductCard = () => (
  <Card variant="outlined" shape="rounded" orientation="horizontal" spacing="none" className="col-span-2 self-start">
    <CardImage
      src="https://picsum.photos/seed/featured-promo/400/534"
      alt="Featured collection"
      shape="rounded"
      className="w-[250px] aspect-400/534 shrink-0 object-cover"
    />
    <CardContent className="flex flex-col gap-3 p-4 min-w-0">
      <Badge size="md" color="accent" className="self-start">Featured</Badge>
      <Text variant="h3" weight="bold">Spring Collection 2026</Text>
      <Text variant="body" color="secondary">
        Discover our latest arrivals — light fabrics and fresh colors for the new season.
      </Text>
      <div className="flex items-center gap-2 mt-auto">
        <Button variant="black" size="48">
          Shop Now
          <ArrowRight className="size-4" />
        </Button>
        <Button variant="tertiary" size="48">Learn More</Button>
      </div>
    </CardContent>
  </Card>
);

const ShoppingUI = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="flex flex-col gap-6 bg-background-primary min-h-screen">
      <header className="flex flex-col gap-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="bold">STORE</Text>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Search">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Wishlist">
              <Heart className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Cart">
              <ShoppingBag className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Account">
              <User className="size-5" />
            </Button>
          </div>
        </div>

        <Input
          variant="labeled"
          fill="outlined"
          label="Search"
          placeholder="Search for products..."
          leftElement={<Search className="size-5 text-icon-secondary" />}
        />

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <InteractiveBadge
              key={cat}
              size="md"
              color="neutral"
              isSelected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </InteractiveBadge>
          ))}
          <InteractiveBadge size="md" color="accent">
            <SlidersHorizontal className="size-4" />
            Filters
          </InteractiveBadge>
        </div>
      </header>

      <Separator color="secondary" />

      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <Text variant="body" color="secondary">{products.length} items</Text>
          <div className="flex items-center gap-2">
            <Badge size="sm" color="ghost">Sort: Featured</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <FeaturedProductCard />
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <Separator color="secondary" />

      <section className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Text variant="title" weight="bold">You Might Also Like</Text>
          <Button variant="link" size="40">
            View all
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {products.slice(0, 4).map((product) => (
            <Card key={product.id} variant="filled" spacing="none" shape="rounded" className="w-44 shrink-0">
              <CardImage
                src={product.image}
                alt={product.name}
                ratio="square"
                shape="rounded"
              />
              <CardContent className="flex flex-col gap-1 p-3 min-w-0">
                <TruncatedText variant="label" weight="regular">{product.name}</TruncatedText>
                <Text variant="label" weight="bold" as="span">${product.price.toFixed(2)}</Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="flex justify-center py-6">
        <Button variant="secondary" size="40" radius="rounded">
          Load More Products
        </Button>
      </div>
    </div>
  );
};

// Showcase: multiple instances — args not applicable
export const ShoppingUIStory: Story = {
  name: "Shopping UI",
  render: () => <ShoppingUI />,
};

// ─────────────────────────────────────────────
// 3. PROJECT MANAGEMENT (Linear-style)
// ─────────────────────────────────────────────

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
  { id: "PRJ-101", title: "Design new onboarding flow", status: "in_progress", priority: "high", assignee: "Alice", label: "Design", dueDate: "Apr 15" },
  { id: "PRJ-102", title: "Implement authentication API", status: "done", priority: "urgent", assignee: "Bob", label: "Backend", dueDate: "Apr 10" },
  { id: "PRJ-103", title: "Set up CI/CD pipeline", status: "done", priority: "medium", assignee: "Charlie", label: "DevOps", dueDate: "Apr 12" },
  { id: "PRJ-104", title: "Create dashboard analytics page", status: "in_progress", priority: "high", assignee: "Diana", label: "Frontend", dueDate: "Apr 18" },
  { id: "PRJ-105", title: "Write API documentation", status: "todo", priority: "medium", assignee: "Eve", label: "Docs", dueDate: "Apr 20" },
  { id: "PRJ-106", title: "Fix notification delivery bug", status: "in_progress", priority: "urgent", assignee: "Frank", label: "Backend", dueDate: "Apr 14" },
  { id: "PRJ-107", title: "Optimize image loading performance", status: "todo", priority: "low", assignee: "Alice", label: "Frontend", dueDate: "Apr 22" },
  { id: "PRJ-108", title: "Add dark mode support", status: "backlog", priority: "low", assignee: "Bob", label: "Design", dueDate: "Apr 25" },
  { id: "PRJ-109", title: "Migrate database to PostgreSQL", status: "backlog", priority: "medium", assignee: "Charlie", label: "Backend", dueDate: "Apr 28" },
  { id: "PRJ-110", title: "User feedback survey integration", status: "todo", priority: "high", assignee: "Diana", label: "Frontend", dueDate: "Apr 19" },
];

const teamMembers = [
  { name: "Alice", avatar: "https://i.pravatar.cc/80?u=alice", tasks: 3 },
  { name: "Bob", avatar: "https://i.pravatar.cc/80?u=bob", tasks: 2 },
  { name: "Charlie", avatar: "https://i.pravatar.cc/80?u=charlie", tasks: 2 },
  { name: "Diana", avatar: "https://i.pravatar.cc/80?u=diana", tasks: 2 },
  { name: "Eve", avatar: "https://i.pravatar.cc/80?u=eve", tasks: 1 },
  { name: "Frank", avatar: "https://i.pravatar.cc/80?u=frank", tasks: 1 },
];

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  done: <CheckCircle2 className="size-4 text-green-5" />,
  in_progress: <Loader2 className="size-4 text-blue-5" />,
  todo: <Circle className="size-4 text-gray-3" />,
  backlog: <Circle className="size-4 text-gray-2" />,
};

const statusConfig: Record<TaskStatus, { label: string; badgeColor: "default" | "ghost" | "neutral" | "accent"; className: string }> = {
  done: { label: "Done", badgeColor: "default", className: "bg-green-1 text-green-5 [--hairline-color:var(--color-green-5)]" },
  in_progress: { label: "In Progress", badgeColor: "default", className: "bg-blue-1 text-blue-5 [--hairline-color:var(--color-blue-5)]" },
  todo: { label: "To Do", badgeColor: "neutral", className: "" },
  backlog: { label: "Backlog", badgeColor: "ghost", className: "" },
};

const priorityConfig: Record<TaskPriority, { label: string; badgeColor: "default" | "ghost" | "neutral" | "accent"; className: string }> = {
  urgent: { label: "Urgent", badgeColor: "default", className: "bg-red-1 text-red-5 [--hairline-color:var(--color-red-5)]" },
  high: { label: "High", badgeColor: "default", className: "bg-orange-1 text-orange-5 [--hairline-color:var(--color-orange-5)]" },
  medium: { label: "Medium", badgeColor: "neutral", className: "" },
  low: { label: "Low", badgeColor: "ghost", className: "" },
};

const ProjectManagement = () => {
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
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Text variant="h2" weight="bold">Sprint 24</Text>
            <Badge size="sm" color="default" className="bg-blue-1 text-blue-5 [--hairline-color:var(--color-blue-5)]">Active</Badge>
          </div>
          <Text variant="body" color="secondary">Apr 1 — Apr 14, 2026 · {tasks.length} issues</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-icon-secondary" />
            <Switch
              variant="filled"
              size="sm"
              checked={notificationsOn}
              onCheckedChange={setNotificationsOn}
            />
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
              <ProgressRow label="Done" value={Math.round((doneCount / tasks.length) * 100)} color="blue">
                <Progress value={Math.round((doneCount / tasks.length) * 100)} color="blue" />
              </ProgressRow>
              <ProgressRow label="In Progress" value={Math.round((inProgressCount / tasks.length) * 100)} color="blue">
                <Progress value={Math.round((inProgressCount / tasks.length) * 100)} color="blue" />
              </ProgressRow>
              <ProgressRow label="To Do" value={Math.round((todoCount / tasks.length) * 100)} color="blue">
                <Progress value={Math.round((todoCount / tasks.length) * 100)} color="blue" />
              </ProgressRow>
            </div>
          </CardContent>
        </Card>
        <Card variant="default" spacing="none">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Text variant="label" color="secondary">Team</Text>
              <Badge size="sm" color="neutral" radius="square">{teamMembers.length} members</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {teamMembers.slice(0, 4).map((member) => (
                <div key={member.name} className="flex items-center gap-2">
                  <Avatar className="size-6 shrink-0">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback userName={member.name} />
                  </Avatar>
                  <Text variant="label" weight="regular" as="span">{member.name}</Text>
                  <Badge size="sm" color="ghost" className="ml-auto">{member.tasks}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
              Urgent ({tasks.filter((t) => t.priority === "urgent").length})
            </InteractiveBadge>
            <InteractiveBadge size="sm" color="default">
              <CalendarDays className="size-3.5" />
              Due soon
            </InteractiveBadge>
          </div>
        </div>

        <TabsContent value="board" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["backlog", "todo", "in_progress", "done"] as TaskStatus[]).map((status) => (
              <div key={status} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {statusIcons[status]}
                  <Text variant="label" weight="regular">{statusConfig[status].label}</Text>
                  <Badge size="sm" color="neutral">{groupedByStatus[status].length}</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {groupedByStatus[status].map((task) => (
                    <Card key={task.id} variant="filled" spacing="none" className="cursor-pointer hover:shadow-highlight-blue transition-shadow">
                      <CardContent className="flex flex-col gap-2 p-3">
                        <div className="flex items-center justify-between">
                          <Text variant="label" color="secondary">{task.id}</Text>
                          <Button variant="ghost" size="icon-sm" aria-label="Task menu">
                            <MoreVertical className="size-4" />
                          </Button>
                        </div>
                        <TruncatedText variant="body" weight="regular">{task.title}</TruncatedText>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            size="sm"
                            color={priorityConfig[task.priority].badgeColor}
                            className={priorityConfig[task.priority].className}
                          >
                            {priorityConfig[task.priority].label}
                          </Badge>
                          <Badge size="sm" color="neutral" radius="square">{task.label}</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="size-3.5 text-icon-secondary" />
                            <Text variant="label" color="secondary">{task.dueDate}</Text>
                          </div>
                          <Avatar className="size-5 shrink-0">
                            <AvatarImage
                              src={`https://i.pravatar.cc/40?u=${task.assignee.toLowerCase()}`}
                              alt={task.assignee}
                            />
                            <AvatarFallback userName={task.assignee} />
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="ghost" size="40" className="w-full border border-dashed border-stroke-secondary">
                    <Plus className="size-4" />
                    Add task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

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
                  <TableHead>Label</TableHead>
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
                      <TruncatedText variant="body" weight="regular" className="max-w-[280px]">
                        {task.title}
                      </TruncatedText>
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        color={statusConfig[task.status].badgeColor}
                        className={statusConfig[task.status].className}
                      >
                        {statusConfig[task.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        color={priorityConfig[task.priority].badgeColor}
                        className={priorityConfig[task.priority].className}
                      >
                        {priorityConfig[task.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge size="sm" color="neutral" radius="square">{task.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5 shrink-0">
                          <AvatarImage
                            src={`https://i.pravatar.cc/40?u=${task.assignee.toLowerCase()}`}
                            alt={task.assignee}
                          />
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

// Showcase: multiple instances — args not applicable
export const ProjectManagementStory: Story = {
  name: "Project Management",
  render: () => <ProjectManagement />,
};

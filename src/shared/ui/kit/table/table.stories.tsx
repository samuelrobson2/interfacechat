import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from ".";
import { Text } from "../text";

const INVOICES = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV-003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
  { id: "INV-004", status: "Paid", method: "Credit Card", amount: "$450.00" },
  { id: "INV-005", status: "Paid", method: "PayPal", amount: "$550.00" },
];

const meta: Meta<typeof Table> = {
  title: "UI/Kit/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "compact"],
      description:
        "Controls cell padding and text variant. `compact` shrinks padding and uses `label` text variant.",
    },
  },
  args: {
    size: "default",
  },
  decorators: [
    (Story) => (
      <div className="p-6 h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>A list of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {INVOICES.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell>{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Compact: Story = {
  args: { size: "compact" },
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {INVOICES.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell>{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <div className="relative">
      <Table {...args}>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INVOICES.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter className="px-3 py-4 flex justify-between">
        <Text variant="label" color="secondary">Total (5 invoices)</Text>
        <Text variant="label" color="primary">$1,750.00</Text>
      </TableFooter>
    </div>
  ),
};

export const Scrollable: Story = {
  render: (args) => (
    <Table {...args} wrapperClassName="h-64">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 20 }, (_, i) => ({
          id: `INV-${String(i + 1).padStart(3, "0")}`,
          status: i % 2 === 0 ? "Paid" : "Pending",
          method: i % 3 === 0 ? "Credit Card" : "PayPal",
          amount: `$${(i + 1) * 100}.00`,
        })).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell>{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

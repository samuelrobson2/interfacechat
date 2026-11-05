import { DatasetStatusIndicatorBadge } from "@/services/dataset";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { cn } from "@/shared/lib/css";
import { HOME_TABS, homeTabPath } from "@/shared/model/routes";
import { Text } from "@/shared/ui/kit/text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { Link } from "react-router-dom";
import { useBuildRunStats } from "../_model/use-build-run-stats";

// Match the table header treatment: light weight, label size, grey.
const HEAD_CLASS = "text-[14px] leading-[1.2] font-light";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

export function BuildRunStats({ className }: { className?: string }) {
  const { rows, isMock } = useBuildRunStats();

  if (rows.length === 0) return null;

  return (
    <div className={cn("w-[888px] max-w-full", className)}>
      {/* Full history lives on the History tab — always a valid in-app route. */}
      <div className="mb-2 flex justify-end px-1">
        <Link
          to={homeTabPath(HOME_TABS.HISTORY)}
          className="flex items-center gap-1 text-typography-secondary transition-colors hover:text-typography-primary"
        >
          <Text variant="label">See full history</Text>
          <ArrowRightIcon pathClasses="stroke-current" />
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={HEAD_CLASS}>Name</TableHead>
            <TableHead className={HEAD_CLASS}>Status</TableHead>
            <TableHead className={HEAD_CLASS}>Win rate</TableHead>
            <TableHead className={HEAD_CLASS}>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {isMock ? (
                  row.name
                ) : (
                  <Link to={row.to} className="hover:underline">
                    {row.name}
                  </Link>
                )}
              </TableCell>
              <TableCell>
                <DatasetStatusIndicatorBadge state={row.status} />
              </TableCell>
              <TableCell>{row.winRate}</TableCell>
              <TableCell className="text-typography-secondary">
                {formatDate(row.date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

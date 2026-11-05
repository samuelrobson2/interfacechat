import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Progress } from "@/shared/ui/kit/progress";
import { Text } from "@/shared/ui/kit/text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";

export type SimpleStatusKind = "none" | "uploading" | "completed" | "failed";

const STATUS_DOT_CLASS: Record<SimpleStatusKind, string> = {
  none: "bg-gray-3",
  uploading: "bg-yellow-5",
  completed: "bg-green-5",
  failed: "bg-red-5",
};

// Progress's color prop only covers default/gradient/blue, so the per-status
// fill is applied straight to the Radix indicator child instead.
const STATUS_PROGRESS_CLASS: Record<SimpleStatusKind, string> = {
  none: "",
  uploading: "[&>[data-slot=progress-indicator]]:bg-yellow-5",
  completed: "[&>[data-slot=progress-indicator]]:bg-green-5",
  failed: "[&>[data-slot=progress-indicator]]:bg-red-5",
};

type SimpleStatusAction = { label: string; onClick?: () => void };

type SimpleStatusCellData = {
  status: SimpleStatusKind;
  label: string;
  value?: string;
  progress?: number;
  action?: SimpleStatusAction;
};

// The dot + label + value + progress + action stack, reused for both the
// ADAPTIVE DATA and AUTOSCIENTIST columns — each carries its own action
// rather than funneling every row into one trailing ACTION column.
function StatusCell({ status, label, value, progress, action }: SimpleStatusCellData) {
  return (
    <div className="flex w-fit min-w-[160px] flex-col items-start gap-2">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASS[status])}
          />
          <Text>{label}</Text>
        </div>
        {value && (
          <Text color="secondary" className="shrink-0">
            {value}
          </Text>
        )}
      </div>

      {progress != null && (
        <Progress value={progress} className={cn("h-1", STATUS_PROGRESS_CLASS[status])} />
      )}

      {action && (
        <Button variant="link" onClick={action.onClick}>
          {action.label} <ArrowRightIcon pathClasses="stroke-current" />
        </Button>
      )}
    </div>
  );
}

export type SimpleDatasetRow = {
  name: string;
  type: "Original" | "Combined";
  description: string;
  date: string;
  adaptiveData: SimpleStatusCellData;
  autoscientist?: SimpleStatusCellData | null;
  interfaceLabel?: string | null;
  winRate?: string | null;
};

const TYPE_BADGE_CLASS: Record<SimpleDatasetRow["type"], string> = {
  Original: "bg-gradient-blue text-blue-5",
  Combined: "bg-gradient-rose border-[0.5px] border-stroke-secondary",
};

// Same column set as the real DatasetsTable so this reads at the exact same
// widths/spacing — only the status columns' design changes.
export const MOCK_SIMPLE_DATASET_ROWS: SimpleDatasetRow[] = [
  {
    name: "Support tickets Q3",
    type: "Original",
    description: "Customer support conversations pulled from Zendesk.",
    date: "07/12/25",
    adaptiveData: {
      status: "none",
      label: "No Source",
      action: { label: "Configure" },
    },
  },
  {
    name: "Product reviews (Amazon)",
    type: "Original",
    description: "Verified purchase reviews for the flagship SKU.",
    date: "07/10/25",
    adaptiveData: {
      status: "uploading",
      label: "Data Uploading",
      value: "42%",
      progress: 42,
      action: { label: "Cancel" },
    },
  },
  {
    name: "Sales call transcripts",
    type: "Original",
    description: "Outbound SDR calls, transcribed and de-identified.",
    date: "07/09/25",
    adaptiveData: {
      status: "uploading",
      label: "Data Uploading",
      value: "78%",
      progress: 78,
      action: { label: "Cancel" },
    },
    autoscientist: {
      status: "uploading",
      label: "Launched",
    },
  },
  {
    name: "Onboarding survey responses",
    type: "Combined",
    description: "Merged NPS and onboarding survey exports.",
    date: "07/02/25",
    adaptiveData: {
      status: "completed",
      label: "Job Completed",
      value: "100%",
      action: { label: "View" },
    },
    autoscientist: {
      status: "uploading",
      label: "Running",
    },
    interfaceLabel: "Create",
  },
  {
    name: "Churn risk emails",
    type: "Original",
    description: "Inbound emails tagged with churn-risk labels.",
    date: "06/28/25",
    adaptiveData: {
      status: "failed",
      label: "Upload Failed",
      value: "3/8",
      action: { label: "Retry" },
    },
  },
  {
    name: "Help center articles",
    type: "Original",
    description: "Public knowledge base articles, current as of June.",
    date: "06/21/25",
    adaptiveData: {
      status: "completed",
      label: "Job Completed",
      value: "100%",
      action: { label: "View" },
    },
    autoscientist: {
      status: "completed",
      label: "Success",
      action: { label: "View" },
    },
    interfaceLabel: "View",
    winRate: "68%",
  },
  {
    name: "Slack support threads",
    type: "Combined",
    description: "Merged #support and #customer-escalations threads.",
    date: "06/14/25",
    adaptiveData: {
      status: "failed",
      label: "Upload Failed",
      value: "1/5",
      action: { label: "Retry" },
    },
    autoscientist: {
      status: "failed",
      label: "Failed",
      action: { label: "Retry" },
    },
  },
  {
    name: "Warranty claim forms",
    type: "Original",
    description: "Scanned and OCR'd warranty claim submissions.",
    date: "06/05/25",
    adaptiveData: {
      status: "completed",
      label: "Job Completed",
      value: "100%",
      action: { label: "View" },
    },
    interfaceLabel: "View",
    winRate: "54%",
  },
];

export function SimpleStatusTable({ rows }: { rows: SimpleDatasetRow[] }) {
  return (
    <Table wrapperClassName="mt-6 max-h-full">
      <TableHeader>
        <TableRow>
          <TableHead>NAME</TableHead>
          <TableHead>TYPE</TableHead>
          <TableHead>DESCRIPTION</TableHead>
          <TableHead>DATE</TableHead>
          <TableHead>ADAPTIVE DATA</TableHead>
          <TableHead>AUTOSCIENTIST</TableHead>
          <TableHead>INTERFACE</TableHead>
          <TableHead>WIN RATE</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="whitespace-normal py-2">{row.name}</TableCell>
            <TableCell className="whitespace-normal py-2">
              <Badge className={cn("py-1.5", TYPE_BADGE_CLASS[row.type])}>
                <span className="text-typography-primary">{row.type}</span>
              </Badge>
            </TableCell>
            <TableCell className="whitespace-normal py-2">
              <span className="line-clamp-2">{row.description}</span>
            </TableCell>
            <TableCell className="whitespace-normal py-2">{row.date}</TableCell>
            <TableCell className="whitespace-normal py-2">
              <StatusCell {...row.adaptiveData} />
            </TableCell>
            <TableCell className="whitespace-normal py-2">
              {row.autoscientist ? (
                <StatusCell {...row.autoscientist} />
              ) : (
                <span className="text-typography-secondary">—</span>
              )}
            </TableCell>
            <TableCell className="whitespace-normal py-2">
              {row.interfaceLabel ? (
                <Button variant="link">
                  {row.interfaceLabel} <ArrowRightIcon pathClasses="stroke-current" />
                </Button>
              ) : (
                <span className="text-typography-secondary">—</span>
              )}
            </TableCell>
            <TableCell className="whitespace-normal py-2">
              {row.winRate ?? <span className="text-typography-secondary">—</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

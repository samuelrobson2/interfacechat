import { HOME_TABS, homeTabPath } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { TableCell, TableRow } from "@/shared/ui/kit/table";
import { Text } from "@/shared/ui/kit/text";
import { Link } from "react-router-dom";

function EmptyContent({ isMobile }: { isMobile?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Text variant="h1">Your Table is Empty</Text>
      <Text className="mt-4 text-wrap" color="secondary">
        Looks like you don't have any datasets yet. <br />
        Add your first one to begin exploring your data
        {isMobile && <br />}
        {isMobile && "Use web desktop version to add your first dataset."}
      </Text>
      {!isMobile && (
        <Button className="mt-10" asChild>
          <Link to={homeTabPath(HOME_TABS.BUILD)}>Start Adapting</Link>
        </Button>
      )}
    </div>
  );
}

export function DatasetsTableEmpty({
  colSpan,
  isMobile,
}: {
  colSpan: number;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return <EmptyContent isMobile />;
  }

  return (
    <TableRow>
      <TableCell className="h-full w-full text-center" colSpan={colSpan}>
        <EmptyContent />
      </TableCell>
    </TableRow>
  );
}

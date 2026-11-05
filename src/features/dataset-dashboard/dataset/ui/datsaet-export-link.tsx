import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";

export const DatasetExportLink = ({
  link,
  image,
}: {
  link: string;
  image: string;
}) => {
  return (
    <Button className="mr-4 justify-start" variant="link" asChild>
      <Link
        to={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5"
      >
        <img src={image} alt="" className="h-6" />
        Export
        <ChevronRightIcon />
      </Link>
    </Button>
  );
};

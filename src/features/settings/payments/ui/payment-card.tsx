import { AlertIcon } from "@/shared/assets/icons/general/Alert";
import { DotVerticalIcon } from "@/shared/assets/icons/outlined/DotVertical";
import { cn } from "@/shared/lib/css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import { Text } from "@/shared/ui/kit/text";

// Payment method images
import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import amexImg from "@/shared/assets/images/payment-methods/american-express.png";
import discoverImg from "@/shared/assets/images/payment-methods/discover.png";
import maestroImg from "@/shared/assets/images/payment-methods/maestro.png";
import mastercardImg from "@/shared/assets/images/payment-methods/mastercard.png";
import visaImg from "@/shared/assets/images/payment-methods/visa.png";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";

// Map card types to images
const CARD_TYPE_IMAGES: Record<string, string> = {
  visa: visaImg,
  mastercard: mastercardImg,
  "master card": mastercardImg,
  amex: amexImg,
  "american express": amexImg,
  discover: discoverImg,
  maestro: maestroImg,
};

export interface PaymentMethod {
  last4: string;
  display_brand: string;
  brand: string;
  isExpired: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export function PaymentCard({
  display_brand,
  brand,
  last4,
  isExpired,
  isSelected = false,
  onSelect,
  onDelete,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Card>, "onSelect"> & PaymentMethod) {
  const cardImage = CARD_TYPE_IMAGES[brand?.toLowerCase() || "visa"] || visaImg;

  return (
    <Card
      className={cn(
        "bg-background-primary flex-row items-center justify-between p-6",
        "transition-colors cursor-pointer",
        isExpired && "cursor-not-allowed",
        className,
      )}
      highlight={isSelected}
      onClick={onSelect}
      {...props}
    >
      <div className="flex gap-3.5 items-center">
        <img src={cardImage} alt={brand} />

        {/* Card info */}
        <div className="flex flex-col gap-2">
          <Text variant="title" weight="bold">
            {display_brand}
          </Text>

          {/* Last 4 digits and expired status */}
          {isExpired ? (
            <div className="flex items-center">
              <Text color="error">**** {last4}</Text>
              <AlertIcon
                className="size-6 ml-4 mr-2"
                pathClasses="stroke-red-500"
              />
              <Text color="error">Expired</Text>
            </div>
          ) : (
            <Text>**** {last4}</Text>
          )}
        </div>
      </div>

      {/* Menu with delete option */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="icon-button" size="icon">
            <DotVerticalIcon className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border border-stroke-secondary"
        >
          <DropdownMenuItem
            className="cursor-pointer py-2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <TrashIcon pathClasses="fill-red-5" />
            <Text color="error">Delete card</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

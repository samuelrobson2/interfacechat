import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DISCORD_LINK } from "@/shared/model/routes";
import feedbackFormImage from "@/shared/assets/images/feedback.png";

export function FeedbackFormDialog({
  trigger,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="flex flex-col items-center justify-center sm:w-[500px] sm:min-w-[500px] sm:max-w-[500px]">
        {" "}
        <DialogHeader className="flex flex-col items-center justify-center">
          <img
            src={feedbackFormImage}
            alt="Feedback form"
            className="aspect-square w-full max-w-[270px]"
          />
          <DialogTitle>Share Feedback</DialogTitle>
          <DialogDescription>
            Join our discord here and get help from our research staff.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex w-full">
          <Button className="flex-1" asChild>
            <Link to={DISCORD_LINK} target="_blank">
              Join
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

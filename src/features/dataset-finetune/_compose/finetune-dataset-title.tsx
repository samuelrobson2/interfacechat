import type { ReactNode } from "react";
import { FinetuneDatasetStepsTitle } from "../_ui/finetune-steps-layout";

export function FinetuneDatasetTitle({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: ReactNode;
}) {
  return <FinetuneDatasetStepsTitle title={title} subtitle={subtitle} />;
}

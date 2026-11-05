import allSizesImage from "@/shared/assets/images/all-sizes.png";
import datasetPreferanceImage from "@/shared/assets/images/dataset-preferance.png";
import finetuneInstructionImage from "@/shared/assets/images/finetune-instruction.png";
import tinyAutoScientistImage from "@/shared/assets/images/tiny-AutoScientist.png";

export const TRAINING_METHOD_IMAGES_MAP = {
  finetune_training_method_instruction: finetuneInstructionImage,
  finetune_training_method_alignment: datasetPreferanceImage,
  finetune_model_size_constraint_all: allSizesImage,
  finetune_model_size_constraint_small: tinyAutoScientistImage,
};

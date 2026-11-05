import trainModelYesImage from "@/shared/assets/images/questionnaire-train-yes.png";
import trainModelNoImage from "@/shared/assets/images/questionnaire-train-no.png";
import datasetInstructionsImage from "@/shared/assets/images/questionnaire-dataset-instructions.png";
import datasetPairsImage from "@/shared/assets/images/questionnaire-dataset-pairs.png";
import brandGuidelinesYesImage from "@/shared/assets/images/questionnaire-brand_yes.png";
import brandGuidelinesNoImage from "@/shared/assets/images/questionnaire-brand_no.png";
import localizationYesImage from "@/shared/assets/images/questionnaire-localization-yes.png";
import localizationNoImage from "@/shared/assets/images/questionnaire-localization-no.png";
import expansionTypeLocalizeImage from "@/shared/assets/images/questionnaire-localize.png";
import expansionTypeTranslateImage from "@/shared/assets/images/questionnaire-translate.png";

export const QUESTIONNAIRE_IMAGES_MAP = {
  train_model_no: trainModelNoImage,
  train_model_yes: trainModelYesImage,
  instruction_dataset: datasetInstructionsImage,
  preference_pairs: datasetPairsImage,
  brand_guidelines_no: brandGuidelinesNoImage,
  brand_guidelines_yes: brandGuidelinesYesImage,
  localize_no: localizationNoImage,
  localize_yes: localizationYesImage,
  expansion_type_translate: expansionTypeTranslateImage,
  expansion_type_localize: expansionTypeLocalizeImage,

};

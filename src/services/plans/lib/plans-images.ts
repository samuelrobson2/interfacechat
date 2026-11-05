import freePlanImage from "@/shared/assets/images/free-plan.png";
import proPlanImage from "@/shared/assets/images/pro-plan.png";
import plusPlanImage from "@/shared/assets/images/plus-plan.png";
import enterprisePlanImage from "@/shared/assets/images/enterprise-plan.png";

export type PaymentPlanType = "Free" | "Pro" | "Plus" | "Enterprise";

export const PLAN_IMAGES: Record<
  PaymentPlanType,
  { image: string; alt: string }
> = {
  Free: {
    image: freePlanImage,
    alt: "Free plan",
  },
  Pro: {
    image: proPlanImage,
    alt: "Pro plan",
  },
  Plus: {
    image: plusPlanImage,
    alt: "Plus plan",
  },
  Enterprise: {
    image: enterprisePlanImage,
    alt: "Enterprise plan",
  },
};

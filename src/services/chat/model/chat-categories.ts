import { cva } from "class-variance-authority";
import artIcon from "@/shared/assets/images/chat-domains/arts-entertainment/art.png";
import entertainmentIcon from "@/shared/assets/images/chat-domains/arts-entertainment/entertainment.png";
import gamesIcon from "@/shared/assets/images/chat-domains/arts-entertainment/games.png";
import musicIcon from "@/shared/assets/images/chat-domains/arts-entertainment/music.png";
import roleplayIcon from "@/shared/assets/images/chat-domains/arts-entertainment/roleplay.png";
import favoriteIcon from "@/shared/assets/images/chat-domains/favorite.png";
import careerWorkplaceIcon from "@/shared/assets/images/chat-domains/finance-insurance/career-workplace.png";
import personalFinanceIcon from "@/shared/assets/images/chat-domains/finance-insurance/personal-finance.png";
import fitnessSportsIcon from "@/shared/assets/images/chat-domains/health-wellbeing/fitness-sports.png";
import medicalIcon from "@/shared/assets/images/chat-domains/health-wellbeing/medical.png";
import personalGrowthIcon from "@/shared/assets/images/chat-domains/health-wellbeing/personal-growth.png";
import scienceIcon from "@/shared/assets/images/chat-domains/health-wellbeing/science.png";
import agricultureIcon from "@/shared/assets/images/chat-domains/industry-infrastructure/agriculture.png";
import architectureDesignIcon from "@/shared/assets/images/chat-domains/industry-infrastructure/architecture-design.png";
import corporateBusinessIcon from "@/shared/assets/images/chat-domains/industry-infrastructure/corporate-business.png";
import governanceIcon from "@/shared/assets/images/chat-domains/industry-infrastructure/governance.png";
import legalIcon from "@/shared/assets/images/chat-domains/industry-infrastructure/legal.png";
import transportationIcon from "@/shared/assets/images/chat-domains/industry-infrastructure/transportation.png";
import beautyIcon from "@/shared/assets/images/chat-domains/information-support/beauty.png";
import fashionBeautyIcon from "@/shared/assets/images/chat-domains/information-support/fashion-beauty.png";
import marketingIcon from "@/shared/assets/images/chat-domains/information-support/marketing.png";
import newsIcon from "@/shared/assets/images/chat-domains/information-support/news.png";
import parentingFamilyIcon from "@/shared/assets/images/chat-domains/information-support/parenting-family.png";
import productAdviceIcon from "@/shared/assets/images/chat-domains/information-support/product-advice.png";
import academicEducationIcon from "@/shared/assets/images/chat-domains/knowledge-learning/academic-education.png";
import geographyIcon from "@/shared/assets/images/chat-domains/knowledge-learning/geography.png";
import historyIcon from "@/shared/assets/images/chat-domains/knowledge-learning/history.png";
import howToIcon from "@/shared/assets/images/chat-domains/knowledge-learning/how-to.png";
import hrIcon from "@/shared/assets/images/chat-domains/knowledge-learning/hr.png";
import languageIcon from "@/shared/assets/images/chat-domains/knowledge-learning/language.png";
import mathIcon from "@/shared/assets/images/chat-domains/knowledge-learning/math.png";
import writingIcon from "@/shared/assets/images/chat-domains/knowledge-learning/writing-editing-communication.png";
import animalNatureIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/animal-nature.png";
import cookingIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/cooking.png";
import cultureIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/culture.png";
import datingIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/dating.png";
import religionIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/religion.png";
import socialIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/social.png";
import sportsIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/sports.png";
import travelIcon from "@/shared/assets/images/chat-domains/lifestyle-culture/travel.png";
import codeIcon from "@/shared/assets/images/chat-domains/technology/code.png";
import dataAnalysisIcon from "@/shared/assets/images/chat-domains/technology/data-analysis-visualization.png";
import marketAnalysisIcon from "@/shared/assets/images/chat-domains/technology/market-analysis.png";
import technologyIcon from "@/shared/assets/images/chat-domains/technology/technology.png";
import uncategorizedIcon from "@/shared/assets/images/chat-domains/uncategorized.png";


// Special folder slug used in the URL for chats without a domain category.
export const UNCATEGORIZED_FOLDER_ID = "uncategorized";
export const UNCATEGORIZED_LABEL = "Uncategorized";

// Special folder id for chats the user pinned as favorites. Matches the fixed
// `id` the backend returns for this virtual directory in GET /chat/directories.
export const FAVORITES_FOLDER_ID = "favorites";
export const FAVORITES_LABEL = "Favorites";

export const CHAT_CATEGORY_COLORS = [
  "favorites",
  UNCATEGORIZED_FOLDER_ID,
  "seafoam",
  "pink",
  "indigo",
  "red",
  "yellow",
  "chartreuse",
  "blue",
  "orange",
] as const;

export type ChatCategoryColor = (typeof CHAT_CATEGORY_COLORS)[number];

export const chatCategoryLightBgVariants = cva("", {
  variants: {
    color: {
      favorites: "bg-[#F5F5F5]",
      uncategorized: "bg-gray-2",
      seafoam: "bg-seafoam-light",
      pink: "bg-pink-light",
      indigo: "bg-indigo-light",
      red: "bg-red-light",
      yellow: "bg-yellow-light",
      chartreuse: "bg-chartreuse-light",
      blue: "bg-blue-light",
      orange: "bg-orange-light",
    } satisfies Record<ChatCategoryColor, string>,
  },
  defaultVariants: { color: "uncategorized" },
});

export const chatCategoryHighlightBgVariants = cva("", {
  variants: {
    color: {
      favorites: "bg-background-primary",
      uncategorized: "bg-[#E5E5E5]",
      seafoam: "bg-seafoam-highlight",
      pink: "bg-pink-highlight",
      indigo: "bg-indigo-highlight",
      red: "bg-red-highlight",
      yellow: "bg-yellow-highlight",
      chartreuse: "bg-chartreuse-highlight",
      blue: "bg-blue-highlight",
      orange: "bg-orange-highlight",
    } satisfies Record<ChatCategoryColor, string>,
  },
  defaultVariants: { color: "uncategorized" },
});

// Tailwind `text-*` utility for the highlight tone — used to drive SVG fill
// via `currentColor` (e.g. the folder silhouette body).
export const chatCategoryHighlightTextVariants = cva("", {
  variants: {
    color: {
      favorites: "text-background-primary",
      uncategorized: "text-[#E5E5E5]",
      seafoam: "text-seafoam-highlight",
      pink: "text-pink-highlight",
      indigo: "text-indigo-highlight",
      red: "text-red-highlight",
      yellow: "text-yellow-highlight",
      chartreuse: "text-chartreuse-highlight",
      blue: "text-blue-highlight",
      orange: "text-orange-highlight",
    } satisfies Record<ChatCategoryColor, string>,
  },
  defaultVariants: { color: "uncategorized" },
});

type ChatCategoryDefinition = {
  label: string;
  color: ChatCategoryColor;
  icon: string;
};

// Keys must exactly match the backend category slugs so server values map directly.
export const CHAT_CATEGORIES_MAP = {
  // Uncategorized — fallback bucket for chats without a domain category (also covers backend "other").
  [UNCATEGORIZED_FOLDER_ID]: {
    label: UNCATEGORIZED_LABEL,
    color: UNCATEGORIZED_FOLDER_ID,
    icon: uncategorizedIcon,
  },

  // Favorites — system folder for chats the user pinned as favorites.
  favorites: { label: "Favorites", color: "favorites", icon: favoriteIcon },

  // Seafoam — Health & Wellbeing.
  science: { label: "Science", color: "seafoam", icon: scienceIcon },
  medical: { label: "Medical", color: "seafoam", icon: medicalIcon },
  "fitness-sports": {
    label: "Fitness & Sports",
    color: "seafoam",
    icon: fitnessSportsIcon,
  },
  "personal-growth": {
    label: "Personal growth",
    color: "seafoam",
    icon: personalGrowthIcon,
  },

  // Pink — Information & Support.
  marketing: { label: "Marketing", color: "pink", icon: marketingIcon },
  news: { label: "News", color: "pink", icon: newsIcon },
  "product-advice": {
    label: "Product advice",
    color: "pink",
    icon: productAdviceIcon,
  },
  "parenting-family": {
    label: "Parenting & Family",
    color: "pink",
    icon: parentingFamilyIcon,
  },
  beauty: { label: "Beauty", color: "pink", icon: beautyIcon },
  "fashion-beauty": {
    label: "Fashion & Beauty",
    color: "pink",
    icon: fashionBeautyIcon,
  },

  // Indigo — Knowledge & Learning.
  "academic-education": {
    label: "Academic & Education",
    color: "indigo",
    icon: academicEducationIcon,
  },
  hr: { label: "HR", color: "indigo", icon: hrIcon },
  history: { label: "History", color: "indigo", icon: historyIcon },
  math: { label: "Math", color: "indigo", icon: mathIcon },
  "how-to": { label: "How-to", color: "indigo", icon: howToIcon },
  geography: { label: "Geography", color: "indigo", icon: geographyIcon },
  language: { label: "Language", color: "indigo", icon: languageIcon },
  "writing-editing-communication": {
    label: "Writing, Editing & Communication",
    color: "indigo",
    icon: writingIcon,
  },

  // Red — Arts & Entertainment.
  music: { label: "Music", color: "red", icon: musicIcon },
  art: { label: "Art", color: "red", icon: artIcon },
  entertainment: {
    label: "Entertainment",
    color: "red",
    icon: entertainmentIcon,
  },
  games: { label: "Games", color: "red", icon: gamesIcon },
  roleplay: { label: "Role-play", color: "red", icon: roleplayIcon },

  // Yellow — Industry & Infrastructure.
  agriculture: {
    label: "Agriculture",
    color: "yellow",
    icon: agricultureIcon,
  },
  "architecture-design": {
    label: "Architecture & Design",
    color: "yellow",
    icon: architectureDesignIcon,
  },
  legal: { label: "Legal", color: "yellow", icon: legalIcon },
  transportation: {
    label: "Transportation",
    color: "yellow",
    icon: transportationIcon,
  },
  "corporate-business": {
    label: "Corporate & Business",
    color: "yellow",
    icon: corporateBusinessIcon,
  },
  governance: {
    label: "Governance",
    color: "yellow",
    icon: governanceIcon,
  },

  // Chartreuse — Finance & Insurance.
  "personal-finance": {
    label: "Personal Finance",
    color: "chartreuse",
    icon: personalFinanceIcon,
  },
  "career-workplace": {
    label: "Career & Workplace",
    color: "chartreuse",
    icon: careerWorkplaceIcon,
  },

  // Blue — Technology.
  technology: { label: "Technology", color: "blue", icon: technologyIcon },
  code: { label: "Code", color: "blue", icon: codeIcon },
  "market-analysis": {
    label: "Market analysis",
    color: "blue",
    icon: marketAnalysisIcon,
  },
  "data-analysis-visualization": {
    label: "Data analysis visualization",
    color: "blue",
    icon: dataAnalysisIcon,
  },

  // Orange — Lifestyle & Culture.
  culture: { label: "Culture", color: "orange", icon: cultureIcon },
  dating: { label: "Dating", color: "orange", icon: datingIcon },
  sports: { label: "Sports", color: "orange", icon: sportsIcon },
  cooking: { label: "Cooking", color: "orange", icon: cookingIcon },
  travel: { label: "Travel", color: "orange", icon: travelIcon },
  "animal-nature": {
    label: "Animal & Nature",
    color: "orange",
    icon: animalNatureIcon,
  },
  religion: { label: "Religion", color: "orange", icon: religionIcon },
  social: { label: "Social", color: "orange", icon: socialIcon },
} as const satisfies Record<string, ChatCategoryDefinition>;

export type ChatCategory = keyof typeof CHAT_CATEGORIES_MAP;

export const CHAT_CATEGORIES = Object.keys(
  CHAT_CATEGORIES_MAP,
) as ChatCategory[];

export const getChatCategoryColor = (
  category: ChatCategory,
): ChatCategoryColor => CHAT_CATEGORIES_MAP[category].color;

export const getChatCategoryLabel = (category: ChatCategory): string =>
  CHAT_CATEGORIES_MAP[category].label;

export const getChatCategoryIcon = (category: ChatCategory): string =>
  CHAT_CATEGORIES_MAP[category].icon;

export const isChatCategory = (
  value: string | null | undefined,
): value is ChatCategory =>
  typeof value === "string" && value in CHAT_CATEGORIES_MAP;

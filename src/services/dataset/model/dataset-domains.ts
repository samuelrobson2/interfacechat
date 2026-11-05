export const DATASET_DOMAINS = {
  ACADEMIC_EDUCATION: "academic_education",
  AGRICULTURE: "agriculture",
  ANIMAL_NATURE: "animal_nature",
  ARCHITECTURE_DESIGN: "architecture_design",
  ART: "art",
  BEAUTY: "beauty",
  CAREER_WORKPLACE: "career_workplace",
  CODE: "code",
  COOKING: "cooking",
  CORPORATE_BUSINESS: "corporate_business",
  CULTURE: "culture",
  DATA_ANALYSIS_VISUALIZATION: "data_analysis_visualization",
  DATING: "dating",
  ENTERTAINMENT: "entertainment",
  FASHION_BEAUTY: "fashion_beauty",
  FITNESS_SPORTS: "fitness_sports",
  GAMES: "games",
  GEOGRAPHY: "geography",
  GOVERNANCE: "governance",
  HISTORY: "history",
  HR: "hr",
  HOW_TO: "how_to",
  LANGUAGE: "language",
  LEGAL: "legal",
  MARKET_ANALYSIS: "market_analysis",
  MARKETING: "marketing",
  MATH: "math",
  MEDICAL: "medical",
  MUSIC: "music",
  NEWS: "news",
  OTHER: "other",
  PARENTING_FAMILY: "parenting_family",
  PERSONAL_FINANCE: "personal_finance",
  PERSONAL_GROWTH: "personal_growth",
  PRODUCT_ADVICE: "product_advice",
  RELIGION: "religion",
  ROLEPLAY: "roleplay",
  SCIENCE: "science",
  SOCIAL: "social",
  SPORTS: "sports",
  TECHNOLOGY: "technology",
  TRANSPORTATION: "transportation",
  TRAVEL: "travel",
  WRITING_EDITING_COMMUNICATION: "writing_editing_communication",
} as const;

export type DatasetDomain = (typeof DATASET_DOMAINS)[keyof typeof DATASET_DOMAINS];

const DATASET_DOMAIN_VALUES = new Set<string>(Object.values(DATASET_DOMAINS));

export function resolveDatasetDomainCode(code: string): DatasetDomain {
  const slug = code.replace(/^domain_/, "").replace(/-/g, "_");

  if (DATASET_DOMAIN_VALUES.has(slug)) {
    return slug as DatasetDomain;
  }

  return DATASET_DOMAINS.OTHER;
}

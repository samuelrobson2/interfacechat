import type { ApiSchemas } from "@/shared/api/schema";

const parseJSON = (value: string, inputType: string) => {
  try {
    return JSON.parse(value);
  } catch {
    switch (inputType) {
      case "array":
      case "select":
      case "range":
        return [];
      case "boolean":
        return false;
      case "string":
      case "number":
      default:
        return "";
    }
  }
};

export function parseNewDatasetValue(field?: ApiSchemas["Field"]) {
  const responseValue = field?.response_values?.[0]?.value;
  const inputType = field?.input_type;

  switch (inputType) {
    case "string":
    case "number":
      return parseJSON(responseValue || "null", inputType) as string;
    case "boolean":
      return parseJSON(responseValue || "false", inputType) as boolean;
    case "array":
    case "select":
    case "range":
      return parseJSON(responseValue || "[]", inputType) as string[];
    default:
      return "";
  }
}

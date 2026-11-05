import { useQuery } from "@tanstack/react-query";
import { chatQueryOptions } from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";

export type ChatDomainGroup = ApiSchemas["ChatDomainGroupDto"];

// Loads the chat domain groups used by the dashboard category filter. Kept as a
// non-suspense query so the filter trigger stays interactive while groups load.
export function useChatDomainGroups() {
  const { data, isLoading } = useQuery(chatQueryOptions.domainGroups());

  return {
    groups: data?.groups ?? [],
    isLoading,
  };
}

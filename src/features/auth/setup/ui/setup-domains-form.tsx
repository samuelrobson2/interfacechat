import { getDomainColorizedIcon } from "@/services/dataset";
import { useDomainsQuery } from "@/services/internalization";
import { Button } from "@/shared/ui/kit/button";
import { InteractiveBadge } from "@/shared/ui/kit/interactive-badge";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text } from "@/shared/ui/kit/text";
import React, { useState } from "react";

export type DomainsFormValues = {
  domains: number[];
};

export function SetupDomainsForm({
  onSubmit,
  isLoading,
  errorMessage,
}: {
  onSubmit: (data: DomainsFormValues) => void;
  isLoading?: boolean;
  errorMessage?: string;
}) {
  const { data: domainsData, isLoading: isLoadingDomains } = useDomainsQuery();
  const [selectedDomains, setSelectedDomains] = useState<Set<number>>(
    new Set(),
  );

  const handleDomainToggle = (domain: number) => {
    setSelectedDomains((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    onSubmit({ domains: Array.from(selectedDomains) });
  };

  const isValid = selectedDomains.size >= 3;

  return (
    <div className="flex flex-col items-center gap-8 h-full">
      <div className="flex w-full md:w-[710px] flex-wrap justify-center gap-1.5 md:gap-3 h-wull">
        {isLoadingDomains
          ? Array.from({ length: 4 }).map((_, index) => (
              <React.Fragment key={index}>
                <Skeleton className="w-[180px] h-[46px] rounded-[56px]" />
                <Skeleton className="w-[46px] h-[46px] rounded-[56px]" />
                <Skeleton className="w-[84px] h-[46px] rounded-[56px]" />
                <Skeleton className="w-[120px] h-[46px] rounded-[56px]" />
                <Skeleton className="w-[156px] h-[46px] rounded-[56px]" />
                <Skeleton className="w-[108px] h-[46px] rounded-[56px]" />
              </React.Fragment>
            ))
          : domainsData?.domains?.map((domain) => (
              <InteractiveBadge
                key={domain.id}
                isSelected={selectedDomains.has(domain.id)}
                onClick={() => handleDomainToggle(domain.id)}
                className="h-[36px] p-[16px]"
              >
                <img
                  src={getDomainColorizedIcon(domain.code)}
                  alt=""
                  className="w-[24px] h-[24px] shrink-0 object-contain"
                />
                {domain.name}
              </InteractiveBadge>
            ))}
      </div>

      {errorMessage && (
        <Text variant="label" color="error">
          {errorMessage}
        </Text>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        isLoading={isLoading}
        className="w-auto"
      >
        {isValid ? "Continue" : "Pick 3 or more to continue"}
      </Button>
    </div>
  );
}

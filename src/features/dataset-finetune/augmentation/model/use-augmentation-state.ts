import { useEffect, useState } from "react";

export function clampAugmentationDatapoints(value: number, max: number) {
  return Math.max(0, Math.min(max, value));
}

export function useAugmentationState({
  initialDomainDatapoints = 0,
  initialGeneralDatapoints = 0,
  maxDomainDatapoints,
  maxGeneralDatapoints,
}: {
  initialDomainDatapoints?: number;
  initialGeneralDatapoints?: number;
  maxDomainDatapoints: number;
  maxGeneralDatapoints: number;
}) {
  const [domainDatapoints, setDomainDatapoints] = useState(
    clampAugmentationDatapoints(initialDomainDatapoints, maxDomainDatapoints),
  );
  const [generalDatapoints, setGeneralDatapoints] = useState(
    clampAugmentationDatapoints(initialGeneralDatapoints, maxGeneralDatapoints),
  );

  useEffect(() => {
    setDomainDatapoints(
      clampAugmentationDatapoints(initialDomainDatapoints, maxDomainDatapoints),
    );
  }, [initialDomainDatapoints, maxDomainDatapoints]);

  useEffect(() => {
    setGeneralDatapoints(
      clampAugmentationDatapoints(initialGeneralDatapoints, maxGeneralDatapoints),
    );
  }, [initialGeneralDatapoints, maxGeneralDatapoints]);

  const updateDomainDatapoints = (value: number) => {
    setDomainDatapoints(clampAugmentationDatapoints(value, maxDomainDatapoints));
  };
  const updateGeneralDatapoints = (value: number) => {
    setGeneralDatapoints(
      clampAugmentationDatapoints(value, maxGeneralDatapoints),
    );
  };

  return {
    domainDatapoints,
    generalDatapoints,
    updateDomainDatapoints,
    updateGeneralDatapoints,
  };
}

type NavigatorUAData = {
  platform?: string;
};

export const getIsMacPlatform = (): boolean => {
  if (typeof navigator === "undefined") return false;

  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData })
    .userAgentData;
  const source = uaData?.platform ?? navigator.platform ?? navigator.userAgent;

  return /mac|iphone|ipad|ipod/i.test(source);
};

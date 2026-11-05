import { useEffect, useEffectEvent, useState } from "react";

export type GeolocationPermission = "granted" | "denied" | "prompt";

export type GeolocationCoords = {
  lat: number;
  lon: number;
};

export type GeolocationState = {
  coords: GeolocationCoords | null;
  error: string | null;
  isLoading: boolean;
  permission: GeolocationPermission;
};

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 5 * 60 * 1000,
  timeout: 10_000,
};

const isGeolocationSupported = (): boolean =>
  typeof navigator !== "undefined" && "geolocation" in navigator;

const isPermissionsApiSupported = (): boolean =>
  typeof navigator !== "undefined" && "permissions" in navigator;

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>(() => {
    if (!isGeolocationSupported()) {
      return {
        coords: null,
        error: "Geolocation is not supported",
        isLoading: false,
        permission: "denied",
      };
    }
    return { coords: null, error: null, isLoading: true, permission: "prompt" };
  });

  const handleSuccess = useEffectEvent((position: GeolocationPosition) => {
    setState({
      coords: {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      },
      error: null,
      isLoading: false,
      permission: "granted",
    });
  });

  const handleError = useEffectEvent((error: GeolocationPositionError) => {
    const isDenied = error.code === error.PERMISSION_DENIED;
    setState({
      coords: null,
      error: error.message,
      isLoading: false,
      permission: isDenied ? "denied" : "prompt",
    });
  });

  const markAsDenied = useEffectEvent(() => {
    setState({
      coords: null,
      error: "Geolocation permission denied",
      isLoading: false,
      permission: "denied",
    });
  });

  const requestPosition = useEffectEvent(() => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      POSITION_OPTIONS,
    );
  });

  useEffect(() => {
    if (!isGeolocationSupported()) return;

    let ignore = false;
    let permissionStatus: PermissionStatus | null = null;

    const handlePermissionState = (permState: PermissionState) => {
      if (permState === "denied") {
        markAsDenied();
      } else {
        // Both "granted" and "prompt" trigger a request. For "prompt" the
        // browser will surface its native dialog automatically.
        requestPosition();
      }
    };

    const onPermissionChange = () => {
      if (ignore || !permissionStatus) return;
      handlePermissionState(permissionStatus.state);
    };

    const init = async () => {
      if (isPermissionsApiSupported()) {
        try {
          // Browser is the source of truth — query the live permission state
          // and subscribe to changes (user toggling it in site settings).
          permissionStatus = await navigator.permissions.query({
            name: "geolocation",
          });
          if (ignore) return;
          handlePermissionState(permissionStatus.state);
          permissionStatus.addEventListener("change", onPermissionChange);
          return;
        } catch {
          // Permissions API does not support "geolocation" in this browser —
          // fall back to a direct request below.
        }
      }

      if (!ignore) requestPosition();
    };

    init();

    return () => {
      ignore = true;
      permissionStatus?.removeEventListener("change", onPermissionChange);
    };
  }, []);

  return state;
};

import { useState, useCallback } from "react";
import { GYMS } from "../lib/brand.js";
import { getNearestGym } from "../lib/logic.js";

/**
 * Hook: resolves user location via the Geolocation API and returns the nearest gym.
 * States: "idle" | "loading" | "success" | "error"
 */
export function useNearestGym() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Your browser doesn't support location services.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { gym, distanceKm } = getNearestGym(coords.latitude, coords.longitude, GYMS);
        setResult({ gym, distanceKm });
        setStatus("success");
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === 1
            ? "Location access denied. Here are both branches:"
            : "Could not fetch your location. Here are both branches:"
        );
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  }, []);

  return { status, result, errorMsg, locate, reset };
}

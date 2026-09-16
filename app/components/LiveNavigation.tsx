"use client";

import { CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";

type Position = [number, number];

type LiveNavigationProps = {
  enabled: boolean;
};

export default function LiveNavigation({
  enabled,
}: LiveNavigationProps) {
  const map = useMap();

  const [location, setLocation] =
    useState<Position | null>(null);

  const [accuracy, setAccuracy] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!enabled) {
      setLocation(null);
      setAccuracy(null);
      setError("");
      return;
    }

    if (!navigator.geolocation) {
      setError(
        "Your browser does not support GPS location."
      );
      return;
    }

    setError("");

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Position = [
            position.coords.latitude,
            position.coords.longitude,
          ];

          setLocation(newLocation);
          setAccuracy(position.coords.accuracy);

          /*
           * Keep the map centered on the visitor.
           */
          map.setView(
            newLocation,
            Math.max(map.getZoom(), 15),
            {
              animate: true,
            }
          );
        },
        (positionError) => {
          console.error(
            "LIVE LOCATION ERROR:",
            positionError
          );

          setError(
            "Unable to get your live location. Please allow location access."
          );
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [enabled, map]);

  if (!enabled) {
    return null;
  }

  if (error) {
    return (
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          bottom: "20px",
          left: "20px",
          right: "20px",
          maxWidth: "360px",
          background: "white",
          border: "1px solid #fecaca",
          borderRadius: "10px",
          padding: "12px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.15)",
          color: "#b91c1c",
          fontWeight: "600",
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  if (!location) {
    return (
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          bottom: "20px",
          left: "20px",
          right: "20px",
          maxWidth: "360px",
          background: "white",
          border: "1px solid #bfdbfe",
          borderRadius: "10px",
          padding: "12px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.15)",
          color: "#1d4ed8",
          fontWeight: "600",
        }}
      >
        📍 Getting your live location...
      </div>
    );
  }

  return (
    <CircleMarker
      center={location}
      radius={9}
      pathOptions={{
        weight: 4,
      }}
    >
      <Popup>
        <div
          style={{
            minWidth: "180px",
          }}
        >
          <strong>
            📍 Your live location
          </strong>

          <p
            style={{
              marginTop: "8px",
              marginBottom: "4px",
            }}
          >
            Your position is being updated
            automatically.
          </p>

          {accuracy !== null && (
            <small>
              GPS accuracy: approximately{" "}
              {Math.round(accuracy)} metres
            </small>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}
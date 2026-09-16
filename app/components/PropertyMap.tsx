"use client";

import dynamic from "next/dynamic";

const PropertyMapClient = dynamic(
  () => import("./PropertyMapClient"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#64748b",
          fontWeight: 600,
          borderRadius: "16px",
        }}
      >
        Loading property map...
      </div>
    ),
  }
);

type PropertyMapProps = {
  propertyLocation?: [number, number];
  propertyName?: string;
  propertyLocationName?: string;
};

export default function PropertyMap({
  propertyLocation = [9.0905, 7.4785],
  propertyName = "Modern 4-Bedroom House",
  propertyLocationName = "Maitama, Abuja",
}: PropertyMapProps) {
  return (
    <PropertyMapClient
      propertyLocation={propertyLocation}
      propertyName={propertyName}
      propertyLocationName={propertyLocationName}
    />
  );
}
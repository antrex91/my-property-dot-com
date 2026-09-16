"use client";

import { useState } from "react";

export type PropertyFilters = {
  search: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
};

type PropertySearchProps = {
  onSearch: (filters: PropertyFilters) => void;
};

const propertyTypes = [
  "All Property Types",
  "Bungalow",
  "Apartment / Flat",
  "Duplex",
  "Detached House",
  "Semi-Detached House",
  "Mansion / Luxury Home",
  "Empty Land / Plot",
  "Commercial Property",
  "Office",
  "Shop / Retail",
  "Industrial Property",
  "Farm / Agricultural Land",
  "Development Site",
];

const bedroomOptions = [
  "Any",
  "1",
  "2",
  "3",
  "4",
  "5+",
];

export default function PropertySearch({
  onSearch,
}: PropertySearchProps) {
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] =
    useState("All Property Types");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("Any");

  const handleSearch = () => {
    onSearch({
      search,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
    });
  };

  const handleReset = () => {
    setSearch("");
    setPropertyType("All Property Types");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("Any");

    onSearch({
      search: "",
      propertyType: "All Property Types",
      minPrice: "",
      maxPrice: "",
      bedrooms: "Any",
    });
  };

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        background: "white",
        borderRadius: "14px",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.08)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "800",
            margin: 0,
          }}
        >
          Find Your Property
        </h2>

        <p
          style={{
            marginTop: "6px",
            color: "#666",
          }}
        >
          Search houses, apartments, land and
          commercial properties across Nigeria.
        </p>
      </div>

      {/* Location Search */}
      <div style={{ marginBottom: "18px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "700",
            marginBottom: "7px",
          }}
        >
          📍 Location
        </label>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by city, area, junction or landmark..."
          style={{
            width: "100%",
            padding: "13px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Property Type */}
      <div style={{ marginBottom: "18px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "700",
            marginBottom: "7px",
          }}
        >
          🏠 Property Type
        </label>

        <select
          value={propertyType}
          onChange={(event) =>
            setPropertyType(event.target.value)
          }
          style={{
            width: "100%",
            padding: "13px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
            background: "white",
          }}
        >
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "18px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            💰 Minimum Price
          </label>

          <input
            type="number"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(event.target.value)
            }
            placeholder="e.g. 50000000"
            min="0"
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            💰 Maximum Price
          </label>

          <input
            type="number"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(event.target.value)
            }
            placeholder="e.g. 150000000"
            min="0"
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "700",
            marginBottom: "7px",
          }}
        >
          🛏️ Bedrooms
        </label>

        <select
          value={bedrooms}
          onChange={(event) =>
            setBedrooms(event.target.value)
          }
          style={{
            width: "100%",
            padding: "13px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
            background: "white",
          }}
        >
          {bedroomOptions.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option === "Any"
                ? "Any Number of Bedrooms"
                : `${option} Bedrooms`}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handleSearch}
          style={{
            flex: "1",
            minWidth: "220px",
            padding: "14px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            fontWeight: "800",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          🔎 Search Properties
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "14px 20px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: "white",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
"use client";

import PropertyCard from "./PropertyCard";
import PropertyVideoCard from "./PropertyVideoCard";
import PropertyAdCard from "./PropertyAdCard";

type Property = {
  id: number;
  name: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  agentName: string;
  whatsappNumber: string;
};

type PropertyVideo = {
  id: number;
  name: string;
  location: string;
  price: string;
  videoUrl: string;
  agentName: string;
  whatsappNumber: string;
};

type PropertyAdvertisement = {
  id: number;
  businessName: string;
  category: string;
  targetLocation: string;
  headline: string;
  description: string;
  imageUrl: string;
  whatsappNumber: string;
  websiteUrl?: string;
  budget: string;
  campaignDuration: string;
};

const properties: Property[] = [
  {
    id: 1,
    name: "Modern 4-Bedroom House",
    location: "Maitama, Abuja",
    price: "₦85,000,000",
    bedrooms: 4,
    bathrooms: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
  },
  {
    id: 2,
    name: "Luxury 3-Bedroom Apartment",
    location: "Wuse 2, Abuja",
    price: "₦65,000,000",
    bedrooms: 3,
    bathrooms: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
  },
  {
    id: 3,
    name: "Family 5-Bedroom Duplex",
    location: "Gwarinpa, Abuja",
    price: "₦95,000,000",
    bedrooms: 5,
    bathrooms: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
  },
  {
    id: 4,
    name: "Affordable 2-Bedroom Apartment",
    location: "Jabi, Abuja",
    price: "₦45,000,000",
    bedrooms: 2,
    bathrooms: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
  },
];

const propertyVideos: PropertyVideo[] = [
  {
    id: 101,
    name: "Luxury Duplex Walkthrough",
    location: "Gwarinpa, Abuja",
    price: "₦120,000,000",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
  },
];

const propertyAdvertisements: PropertyAdvertisement[] = [
  {
    id: 201,
    businessName: "Premium Roof Solutions",
    category: "Roofing",
    targetLocation: "Abuja",
    headline: "Quality Roofing Solutions for Your Property",
    description:
      "Roofing materials, installation and professional roofing services for residential and commercial properties.",
    imageUrl:
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=80",
    whatsappNumber: "2348000000000",
    websiteUrl: "https://example.com",
    budget: "₦100,000",
    campaignDuration: "30 days",
  },
  {
    id: 202,
    businessName: "Home Paint Nigeria",
    category: "Paint & Decoration",
    targetLocation: "Abuja",
    headline: "Give Your Property a New Look",
    description:
      "Interior and exterior paints, professional painting services and property finishing solutions.",
    imageUrl:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
    whatsappNumber: "2348000000000",
    websiteUrl: "https://example.com",
    budget: "₦75,000",
    campaignDuration: "14 days",
  },
];

export default function MarketplaceFeed() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "50px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            margin: "0 0 8px",
            color: "#2563eb",
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "1px",
          }}
        >
          MY PROPERTY DOT COM
        </p>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "34px",
            fontWeight: "900",
            color: "#111827",
          }}
        >
          Property Marketplace
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: "760px",
            color: "#6b7280",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          Discover properties, watch property videos, find property-related
          products and services, and connect directly with owners, agents and
          businesses through WhatsApp.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <PropertyCard {...properties[0]} />
        </div>

        <div style={{ minWidth: 0 }}>
          <PropertyCard {...properties[1]} />
        </div>

        <div style={{ minWidth: 0 }}>
          <PropertyVideoCard {...propertyVideos[0]} />
        </div>

        <div style={{ minWidth: 0 }}>
          <PropertyAdCard {...propertyAdvertisements[0]} />
        </div>

        <div style={{ minWidth: 0 }}>
          <PropertyCard {...properties[2]} />
        </div>

        <div style={{ minWidth: 0 }}>
          <PropertyCard {...properties[3]} />
        </div>

        <div style={{ minWidth: 0 }}>
          <PropertyAdCard {...propertyAdvertisements[1]} />
        </div>

        <div style={{ minWidth: 0 }}>
          <PropertyVideoCard {...propertyVideos[0]} />
        </div>
      </div>

      <div
        style={{
          marginTop: "35px",
          padding: "18px 20px",
          borderRadius: "14px",
          background: "#eff6ff",
          border: "1px solid #dbeafe",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#1e40af",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <strong>Marketplace:</strong> Property listings, property videos and
          sponsored property-related businesses can appear together throughout
          the feed.
        </p>
      </div>
    </section>
  );
}
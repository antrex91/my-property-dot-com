import Link from "next/link";
import PropertyMap from "../../components/PropertyMap";

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
  description: string;
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
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
    description:
      "A modern family home in Maitama, Abuja, offering spacious living areas, comfortable bedrooms and a convenient location close to major roads and amenities.",
  },
  {
    id: 2,
    name: "Luxury 3-Bedroom Apartment",
    location: "Wuse 2, Abuja",
    price: "₦65,000,000",
    bedrooms: 3,
    bathrooms: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
    description:
      "A luxury apartment located in Wuse 2, Abuja, with modern finishes, spacious rooms and easy access to shops, offices and other amenities.",
  },
  {
    id: 3,
    name: "Family 5-Bedroom Duplex",
    location: "Gwarinpa, Abuja",
    price: "₦95,000,000",
    bedrooms: 5,
    bathrooms: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
    description:
      "A spacious five-bedroom family duplex in Gwarinpa, Abuja, suitable for families looking for comfort, space and accessibility.",
  },
  {
    id: 4,
    name: "Affordable 2-Bedroom Apartment",
    location: "Jabi, Abuja",
    price: "₦45,000,000",
    bedrooms: 2,
    bathrooms: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
    agentName: "Property Agent",
    whatsappNumber: "2348000000000",
    description:
      "A comfortable two-bedroom apartment in Jabi, Abuja, positioned close to important roads, businesses and everyday amenities.",
  },
];

export default function PropertyDetailsPage() {
  const property = properties[0];

  const whatsappMessage = encodeURIComponent(
    `Hello ${property.agentName}, I am interested in the property "${property.name}" in ${property.location} listed on MY PROPERTY DOT COM.`
  );

  const whatsappUrl = `https://wa.me/${property.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            ← Back to MY PROPERTY DOT COM
          </Link>
        </div>
      </header>

      {/* PROPERTY CONTENT */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px 60px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
          }}
        >
          {/* PROPERTY IMAGE */}
          <div
            style={{
              width: "100%",
              height: "500px",
              background: "#e5e7eb",
            }}
          >
            <img
              src={property.imageUrl}
              alt={property.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* PROPERTY INFORMATION */}
          <div
            style={{
              padding: "30px",
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: "800",
                textTransform: "uppercase",
              }}
            >
              Property for Sale
            </p>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "36px",
                fontWeight: "900",
                color: "#111827",
              }}
            >
              {property.name}
            </h1>

            <p
              style={{
                margin: "0 0 20px",
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              📍 {property.location}
            </p>

            <p
              style={{
                margin: "0 0 25px",
                color: "#166534",
                fontSize: "28px",
                fontWeight: "900",
              }}
            >
              💰 {property.price}
            </p>

            {/* PROPERTY FEATURES */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <strong>🛏 Bedrooms</strong>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#475569",
                  }}
                >
                  {property.bedrooms}
                </div>
              </div>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <strong>🛁 Bathrooms</strong>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#475569",
                  }}
                >
                  {property.bathrooms}
                </div>
              </div>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <strong>📍 Location</strong>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#475569",
                  }}
                >
                  {property.location}
                </div>
              </div>
            </div>

            {/* ABOUT PROPERTY */}
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "24px",
                fontWeight: "800",
              }}
            >
              About this property
            </h2>

            <p
              style={{
                margin: "0 0 30px",
                color: "#475569",
                fontSize: "16px",
                lineHeight: "1.7",
              }}
            >
              {property.description}
            </p>

            {/* PROPERTY LOCATION MAP */}
            <div
              style={{
                marginBottom: "30px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                📍 Property Location
              </h2>

              <p
                style={{
                  margin: "0 0 16px",
                  color: "#64748b",
                  fontSize: "15px",
                  lineHeight: "1.6",
                }}
              >
                Explore the location of this property in {property.location}.
                You can zoom in and out of the map to explore the surrounding
                area.
              </p>

              <div
                style={{
                  width: "100%",
                  height: "500px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                }}
              >
                <PropertyMap />
              </div>
            </div>

            {/* AGENT INFORMATION */}
            <div
              style={{
                padding: "22px",
                borderRadius: "14px",
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                marginBottom: "25px",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                LISTED BY
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: "800",
                }}
              >
                {property.agentName}
              </p>
            </div>

            {/* WHATSAPP */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                width: "100%",
                padding: "15px",
                borderRadius: "10px",
                background: "#16a34a",
                color: "white",
                textAlign: "center",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "800",
                boxSizing: "border-box",
              }}
            >
              💬 Contact Agent on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
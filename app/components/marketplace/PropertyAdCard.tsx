"use client";

type PropertyAdCardProps = {
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

export default function PropertyAdCard({
  businessName,
  category,
  targetLocation,
  headline,
  description,
  imageUrl,
  whatsappNumber,
  websiteUrl,
  budget,
  campaignDuration,
}: PropertyAdCardProps) {
  const whatsappMessage = encodeURIComponent(
    `Hello ${businessName}, I saw your advertisement on MY PROPERTY DOT COM and I am interested in your ${category} services/products.`
  );

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <article
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* AD IMAGE */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "230px",
          overflow: "hidden",
          background: "#f3f4f6",
        }}
      >
        <img
          src={imageUrl}
          alt={headline}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            padding: "5px 9px",
            borderRadius: "999px",
            background: "rgba(17,24,39,0.85)",
            color: "white",
            fontSize: "11px",
            fontWeight: "800",
          }}
        >
          📢 SPONSORED
        </div>
      </div>

      {/* AD INFORMATION */}
      <div
        style={{
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              padding: "5px 9px",
              borderRadius: "999px",
              background: "#eff6ff",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: "800",
            }}
          >
            {category}
          </span>

          <span
            style={{
              color: "#6b7280",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            📍 {targetLocation}
          </span>
        </div>

        <p
          style={{
            margin: "0 0 5px",
            color: "#6b7280",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {businessName}
        </p>

        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "20px",
            fontWeight: "800",
            color: "#111827",
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            margin: "0 0 14px",
            color: "#4b5563",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          {description}
        </p>

        {/* CAMPAIGN INFORMATION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              borderRadius: "10px",
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "700",
              }}
            >
              CAMPAIGN BUDGET
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "14px",
                color: "#111827",
                fontWeight: "800",
              }}
            >
              {budget}
            </div>
          </div>

          <div
            style={{
              padding: "10px",
              borderRadius: "10px",
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "700",
              }}
            >
              CAMPAIGN DURATION
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "14px",
                color: "#111827",
                fontWeight: "800",
              }}
            >
              {campaignDuration}
            </div>
          </div>
        </div>

        {/* CONTACT BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minWidth: "130px",
              padding: "11px 14px",
              borderRadius: "8px",
              background: "#16a34a",
              color: "white",
              fontWeight: "700",
              textAlign: "center",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            💬 WhatsApp
          </a>

          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                minWidth: "130px",
                padding: "11px 14px",
                borderRadius: "8px",
                background: "#111827",
                color: "white",
                fontWeight: "700",
                textAlign: "center",
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              🔗 Learn More
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
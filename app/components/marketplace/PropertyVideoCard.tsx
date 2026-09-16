"use client";

type PropertyVideoCardProps = {
  id: number;
  name: string;
  location: string;
  price: string;
  videoUrl: string;
  agentName: string;
  whatsappNumber: string;
};

export default function PropertyVideoCard({
  name,
  location,
  price,
  videoUrl,
  agentName,
  whatsappNumber,
}: PropertyVideoCardProps) {
  const whatsappMessage = encodeURIComponent(
    `Hello ${agentName}, I saw your property video on MY PROPERTY DOT COM and I am interested in ${name}.`
  );

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <article
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* VIDEO */}

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "#111827",
          overflow: "hidden",
        }}
      >
        <video
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* VIDEO LABEL */}

        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            padding: "6px 10px",
            borderRadius: "999px",
            background: "rgba(17,24,39,0.88)",
            color: "white",
            fontSize: "11px",
            fontWeight: "800",
            pointerEvents: "none",
          }}
        >
          🎥 PROPERTY VIDEO
        </div>
      </div>

      {/* VIDEO INFORMATION */}

      <div
        style={{
          padding: "16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            margin: "0 0 5px",
            color: "#2563eb",
            fontSize: "12px",
            fontWeight: "800",
            textTransform: "uppercase",
          }}
        >
          Featured Property
        </p>

        <h2
          style={{
            margin: "0 0 7px",
            color: "#111827",
            fontSize: "20px",
            fontWeight: "800",
          }}
        >
          {name}
        </h2>

        <p
          style={{
            margin: "0 0 5px",
            color: "#6b7280",
            fontSize: "13px",
          }}
        >
          📍 {location}
        </p>

        <p
          style={{
            margin: "0 0 14px",
            color: "#111827",
            fontSize: "18px",
            fontWeight: "800",
          }}
        >
          {price}
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: "auto",
            display: "block",
            padding: "11px 14px",
            borderRadius: "8px",
            background: "#16a34a",
            color: "white",
            fontWeight: "700",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          💬 WhatsApp Agent
        </a>
      </div>
    </article>
  );
}
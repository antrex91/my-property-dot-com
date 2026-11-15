"use client";
import { useState } from "react";

type Props = {
  property: any;
};

const emojis = ["😍","🔥","👏","🏠","💯","❤️","😊","👍","🎉","💰","✅","📍","😂","🥰"];

export default function SuperCard({ property }: Props) {
  const [currentImg, setCurrentImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(property.likes || 12);
  const [followed, setFollowed] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const images = property.images || [property.image];
  const hasVideo = property.video;
  const mapQuery = encodeURIComponent(property.location || "Abuja");
  const mapSearchUrl = "https://www.google.com/maps/search/?api=1&query=" + mapQuery;
  const mapEmbedUrl = "https://maps.google.com/maps?q=" + mapQuery + "&z=14&output=embed";

  const next = () => setCurrentImg((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentImg((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
      <div style={{ position: "relative", height: "220px", background: "#000" }}>
        {hasVideo && currentImg === 0? (
          <video src={hasVideo} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <img src={images[currentImg]} alt="property" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        {images.length > 1 && (
          <>
            <button onClick={prev} style={{ position: "absolute", left: "10px", top: "50%", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}>{"<"}</button>
            <button onClick={next} style={{ position: "absolute", right: "10px", top: "50%", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}>{">"}</button>
          </>
        )}
      </div>

      <div style={{ padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>{property.title || property.name}</b>
          <span style={{ color: "#16a34a", fontWeight: "bold" }}>{property.price}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
          <div style={{ fontSize: "13px", color: "#64748b" }}>📍 {property.location}</div>
          <a href={mapSearchUrl} target="_blank" style={{ fontSize: "11px", background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "20px", textDecoration: "none", fontWeight: "bold" }}>🗺️ Map</a>
        </div>

        <div style={{ marginTop: "10px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <iframe width="100%" height="120" style={{ border: 0 }} loading="lazy" src={mapEmbedUrl} title="map"></iframe>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <button onClick={() => { setLiked(!liked); setLikes(liked? likes - 1 : likes + 1); }} style={{ flex: 1, border: "1px solid #e2e8f0", background: liked? "#fee2e2" : "white", borderRadius: "20px", padding: "6px", cursor: "pointer" }}>{liked? "❤️" : "🤍"} {likes}</button>
          <button onClick={() => setFollowed(!followed)} style={{ flex: 1, border: "none", background: followed? "#000" : "#3b82f6", color: "white", borderRadius: "20px", padding: "6px", cursor: "pointer", fontWeight: "bold" }}>{followed? "Following" : "+ Follow"}</button>
        </div>

        <div style={{ marginTop: "12px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "20px", padding: "8px 14px", outline: "none" }} />
            <button onClick={() => setShowEmoji(!showEmoji)} style={{ border: "1px solid #e2e8f0", background: "#fef3c7", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer" }}>😊</button>
            <button onClick={() => { if (comment.trim()) { setComments([...comments, comment]); setComment(""); } }} style={{ background: "#000", color: "white", border: "none", borderRadius: "20px", padding: "8px 14px", cursor: "pointer" }}>Post</button>
          </div>

          {showEmoji && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", background: "#f8fafc", padding: "10px", borderRadius: "12px" }}>
              {emojis.map((e) => (
                <span key={e} onClick={() => setComment(comment + e)} style={{ cursor: "pointer", fontSize: "22px", background: "white", padding: "4px", borderRadius: "6px" }}>{e}</span>
              ))}
            </div>
          )}

          <div style={{ marginTop: "8px" }}>
            {comments.map((c, i) => (
              <div key={i} style={{ fontSize: "13px", background: "#f1f5f9", padding: "6px 10px", borderRadius: "12px", marginTop: "4px" }}>{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
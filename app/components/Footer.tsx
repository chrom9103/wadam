import React from "react";

export default function Footer() {
  return (
    <footer style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
      <div>© {new Date().getFullYear()} MAOS. All rights reserved.</div>
    </footer>
  );
}

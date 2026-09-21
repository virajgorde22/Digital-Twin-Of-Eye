import { useEffect, useState } from "react";
import { fetchAuthenticatedImage } from "../../utils/image";
import { getToken } from "../../services/api";

export default function RetinalImage({ src, alt = "Retinal fundus image", className = "scan-thumb", fallback }) {
  const [url, setUrl] = useState(fallback || "");

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setUrl(fallback || "");
      return;
    }
    if (src.startsWith("blob:") || src.startsWith("data:")) {
      setUrl(src);
      return;
    }
    fetchAuthenticatedImage(src, getToken()).then((resolved) => {
      if (!cancelled) setUrl(resolved || fallback || "");
    });
    return () => {
      cancelled = true;
    };
  }, [src, fallback]);

  if (!url) {
    return (
      <div className={className} style={{ display: "grid", placeItems: "center", color: "#829AB1" }}>
        Retinal image unavailable
      </div>
    );
  }

  return <img className={className} src={url} alt={alt} />;
}

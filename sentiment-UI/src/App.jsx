import { useState, useRef, useEffect } from "react";

// this url is when run the backend locally. Change if your API is hosted elsewhere (e.g. Render, Heroku, etc.)
// const API_BASE = "http://localhost:8000";

const API_BASE = "https://review-sentiment-analysis-tkp4.onrender.com";

// ── Mock predict for demo (swap with real fetch when API is running) ──────────
async function callPredict(review) {
  // PRODUCTION: uncomment below and remove mock
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review }),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

const EXAMPLES = [
  "The food was absolutely incredible, best pasta I've ever had!",
  "Service was slow and the steak was completely overcooked.",
  "Cozy atmosphere, friendly staff, and the dessert was divine.",
  "Overpriced and underwhelming. Would not come back.",
];

export default function App() {
  const [review, setReview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const textRef = useRef(null);

  useEffect(() => {
    setCharCount(review.length);
  }, [review]);

  const handleSubmit = async () => {
    if (!review.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await callPredict(review);
      setResult(data);
      setHistory(prev => [data, ...prev].slice(0, 8));
    } catch (e) {
      setError(`Could not reach the API. Make sure the FastAPI server is running. ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex) => {
    setReview(ex);
    setResult(null);
    setError(null);
    textRef.current?.focus();
  };

  const isPositive = result?.sentiment === "positive";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      width: "100vw",
      boxSizing: "border-box",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8e4d9",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse 60% 50% at 20% 10%, rgba(255,180,50,0.07) 0%, transparent 60%),
                     radial-gradient(ellipse 50% 40% at 80% 80%, rgba(120,80,200,0.08) 0%, transparent 60%)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "100%", margin: "0 auto", padding: "48px 80px 80px", width: "100%" }}>

        {/* Header */}
        <div style={{ marginBottom: 52, borderBottom: "1px solid rgba(232,228,217,0.1)", paddingBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "linear-gradient(135deg, #f5c842, #e07b39)",
              boxShadow: "0 0 14px rgba(245,200,66,0.5)",
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(232,228,217,0.45)", fontFamily: "monospace" }}>
              NLP · Sentiment Analysis · v1.0
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 400, margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            How does your review<br />
            <em style={{ color: "#f5c842", fontStyle: "italic" }}>really</em> feel?
          </h1>
          <p style={{ marginTop: 14, color: "rgba(232,228,217,0.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 460 }}>
            Naive Bayes classifier trained on 1,000 restaurant reviews.
            Paste any review below to get an instant sentiment prediction.
          </p>
        </div>

        {/* Example chips */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(232,228,217,0.3)", marginBottom: 12, fontFamily: "monospace" }}>
            Try an example
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => handleExample(ex)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(232,228,217,0.15)",
                  color: "rgba(232,228,217,0.6)",
                  padding: "6px 14px",
                  borderRadius: 2,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "Georgia, serif",
                  transition: "all 0.2s",
                  maxWidth: 220,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "rgba(245,200,66,0.4)"; e.target.style.color = "#e8e4d9"; }}
                onMouseLeave={e => { e.target.style.borderColor = "rgba(232,228,217,0.15)"; e.target.style.color = "rgba(232,228,217,0.6)"; }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <textarea
            ref={textRef}
            value={review}
            onChange={e => setReview(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(); }}
            placeholder="Write or paste a restaurant review here…"
            maxLength={2000}
            rows={5}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(232,228,217,0.14)",
              borderRadius: 4,
              color: "#e8e4d9",
              fontSize: 16,
              lineHeight: 1.8,
              padding: "20px 24px",
              resize: "vertical",
              outline: "none",
              fontFamily: "Georgia, serif",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(245,200,66,0.35)"}
            onBlur={e => e.target.style.borderColor = "rgba(232,228,217,0.14)"}
          />
          <div style={{
            position: "absolute", bottom: 12, right: 16,
            fontSize: 11, fontFamily: "monospace",
            color: charCount > 1800 ? "#e07b39" : "rgba(232,228,217,0.25)",
          }}>
            {charCount}/2000
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !review.trim()}
          style={{
            background: loading || !review.trim() ? "rgba(245,200,66,0.2)" : "#f5c842",
            color: loading || !review.trim() ? "rgba(10,10,15,0.4)" : "#0a0a0f",
            border: "none",
            padding: "14px 36px",
            fontSize: 14,
            fontFamily: "Georgia, serif",
            letterSpacing: "0.04em",
            fontWeight: 600,
            borderRadius: 3,
            cursor: loading || !review.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 16 }}>⟳</span>
              Analysing…
            </>
          ) : (
            <>Analyse sentiment  <span style={{ opacity: 0.5, fontSize: 12, fontFamily: "monospace" }}>⌘↵</span></>
          )}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 24, padding: "14px 20px",
            border: "1px solid rgba(224,123,57,0.4)",
            borderRadius: 4, background: "rgba(224,123,57,0.07)",
            color: "#e07b39", fontSize: 14, lineHeight: 1.6,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result card */}
        {result && !loading && (
          <div style={{
            marginTop: 36,
            border: `1px solid ${isPositive ? "rgba(80,200,120,0.3)" : "rgba(220,80,80,0.3)"}`,
            borderRadius: 6,
            overflow: "hidden",
            animation: "fadeUp 0.4s ease both",
          }}>
            {/* Top bar */}
            <div style={{
              background: isPositive ? "rgba(80,200,120,0.08)" : "rgba(220,80,80,0.08)",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 32 }}>{isPositive ? "🟢" : "🔴"}</span>
                <div>
                  <div style={{
                    fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em",
                    color: isPositive ? "#7ee8a2" : "#f08080",
                  }}>
                    {isPositive ? "Positive review" : "Negative review"}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(232,228,217,0.45)", marginTop: 2, fontFamily: "monospace" }}>
                    label: {result.label} · {result.processing_ms}ms
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div style={{ textAlign: "right", minWidth: 120 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,228,217,0.35)", fontFamily: "monospace", marginBottom: 6 }}>
                  Confidence
                </div>
                <div style={{ fontSize: 28, fontWeight: 300, fontFamily: "monospace", color: isPositive ? "#7ee8a2" : "#f08080" }}>
                  {(result.confidence * 100).toFixed(1)}<span style={{ fontSize: 14 }}>%</span>
                </div>
                <div style={{
                  marginTop: 6, height: 4, background: "rgba(232,228,217,0.1)", borderRadius: 2, width: 120,
                }}>
                  <div style={{
                    height: "100%", borderRadius: 2, width: `${result.confidence * 100}%`,
                    background: isPositive ? "#7ee8a2" : "#f08080",
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            </div>

            {/* Review text */}
            <div style={{ padding: "18px 28px", borderTop: "1px solid rgba(232,228,217,0.06)" }}>
              <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,228,217,0.3)", fontFamily: "monospace", marginBottom: 8 }}>
                Input review
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(232,228,217,0.75)", margin: 0, fontStyle: "italic" }}>
                "{result.review}"
              </p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div style={{ marginTop: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(232,228,217,0.3)", fontFamily: "monospace", margin: 0 }}>
                Recent predictions
              </p>
              <div style={{ flex: 1, height: 1, background: "rgba(232,228,217,0.07)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.slice(1).map((h, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 18px",
                  background: "rgba(255,255,255,0.02)", borderRadius: 4,
                  border: "1px solid rgba(232,228,217,0.06)",
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{h.sentiment === "positive" ? "🟢" : "🔴"}</span>
                  <span style={{ fontSize: 14, flex: 1, color: "rgba(232,228,217,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.review}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(232,228,217,0.3)", flexShrink: 0 }}>
                    {(h.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 72, paddingTop: 24, borderTop: "1px solid rgba(232,228,217,0.07)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(232,228,217,0.2)" }}>
            MultinomialNB · BoW · 74% accuracy
          </span>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(232,228,217,0.2)" }}>
            POST /predict · POST /predict/batch
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        textarea::placeholder { color: rgba(232,228,217,0.2); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(232,228,217,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm";
import "./App.css";

function App() {
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [barValue, setBarValue] = useState(0);
  const [stage, setStage] = useState("idle");

  useEffect(() => {
    let timer;
    if (stage === "uploading") {
      setBarValue(uploadPercent * 0.7);
    } else if (stage === "transcribing") {
      timer = setInterval(() => setBarValue((last) => Math.min(last + 2, 90)), 120);
    } else if (stage === "summarizing") {
      timer = setInterval(() => setBarValue((last) => Math.min(last + 2, 100)), 120);
    } else if (stage === "idle") {
      setBarValue(0);
    }
    return () => clearInterval(timer);
  }, [stage, uploadPercent]);

  const handleDownload = (type) => {
    if (!summary) return;
    let content = summary;
    let mime = "text/plain";
    let ext = "txt";
    if (type === "md") {
      mime = "text/markdown";
      ext = "md";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-summary.${ext}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 200);
  };

  return (
    <div className="app-container">
      <h1>Automatic Meeting Assistant</h1>
      <p className="description">Upload your meeting MP3 and get an instant AI-powered summary!</p>
      <UploadForm
        setSummary={setSummary}
        setError={setError}
        setLoading={setLoading}
        setUploadPercent={setUploadPercent}
        setStage={setStage}
      />
      <ProgressBar stage={stage} value={barValue} uploadPercent={uploadPercent} />
      {error && <div className="error-message">{error}</div>}
      {summary && !error && (
        <div className="summary-section">
          <h2>Summary</h2>
          <div className="summary-download-row">
            <button
              className="summary-download-btn"
              onClick={() => handleDownload("txt")}
            >
              Download .txt
            </button>
            <button
              className="summary-download-btn"
              onClick={() => handleDownload("md")}
            >
              Download .md
            </button>
          </div>
          <pre>{summary}</pre>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ stage, value, uploadPercent }) {
  if (stage === "uploading") {
    return (
      <div className="progress-stages">
        <div className="progress-label">
          Uploading your MP3... ({uploadPercent}%)
        </div>
        <div className="progressbar-container">
          <div className="progress-bar" style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  }
  if (stage === "transcribing") {
    return (
      <div className="progress-stages">
        <div className="progress-label">Transcribing your MP3…</div>
        <div className="progressbar-container">
          <div className="progress-bar" style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  }
  if (stage === "summarizing") {
    return (
      <div className="progress-stages">
        <div className="progress-label">Summarizing your meeting…</div>
        <div className="progressbar-container">
          <div className="progress-bar" style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  }
  return null;
}

export default App;
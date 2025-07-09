import React, { useRef, useState } from "react";

const UploadForm = ({ setSummary, setError, setLoading, setUploadPercent, setStage }) => {
  const fileInput = useRef();
  const [chosenFile, setChosenFile] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setChosenFile(file ? file.name : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSummary("");
    setError("");
    setLoading(true);
    setStage("uploading");
    setUploadPercent(0);
    setChosenFile(""); // Hide file-chosen-message as soon as you start upload

    const file = fileInput.current.files[0];
    if (!file) return;
    // Client-side size check: 10MB = 10 * 1024 * 1024 bytes
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large (max 10MB allowed).");
      setLoading(false);
      setStage("idle");
      setUploadPercent(0);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new window.XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    const TIMEOUT = 20000; // 20 seconds
    let timeoutHandle = setTimeout(() => {
      xhr.abort();
    }, TIMEOUT);

    xhr.upload.addEventListener("progress", function (event) {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadPercent(percent);
      }
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        clearTimeout(timeoutHandle);
        if (xhr.status === 0) {
          setError("Upload failed: Connection lost or file too large (likely over 10MB).");
          setStage("idle");
          setUploadPercent(0);
          setLoading(false);
          return;
        }
        const defaultError =
          xhr.status === 413
            ? "File is too large (max 10MB allowed)."
            : "Upload failed or server error.";
        if (xhr.status !== 200) {
          let msg = defaultError;
          try {
            const data =
              xhr.responseText && JSON.parse(xhr.responseText);
            msg = (data && data.error) ? data.error : defaultError;
          } catch {}
          setError(msg);
          setStage("idle");
          setUploadPercent(0);
          setLoading(false);
          return;
        }
        try {
          const data = JSON.parse(xhr.responseText);
          setStage("transcribing");
          setUploadPercent(100);
          setTimeout(() => setStage("summarizing"), 500);
          setTimeout(() => {
            setSummary(data.summary || "No summary returned");
            setError("");
            setStage("idle");
            setLoading(false);
          }, 1200);
        } catch {
          setError("Upload failed or server error.");
          setStage("idle");
          setUploadPercent(0);
          setLoading(false);
        }
      }
    };

    xhr.onerror = function () {
      clearTimeout(timeoutHandle);
      setError("Upload failed or was cancelled (possible file too large).");
      setStage("idle");
      setUploadPercent(0);
      setLoading(false);
    };

    xhr.onabort = function () {
      clearTimeout(timeoutHandle);
      setError("Upload aborted.");
      setStage("idle");
      setUploadPercent(0);
      setLoading(false);
    };

    xhr.send(formData);
  };

  return (
    <>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-upload-label">
          Upload your mp3 file
          <input
            ref={fileInput}
            type="file"
            accept=".mp3,audio/mp3"
            required
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </label>
        <button type="submit">Upload & Summarize</button>
      </form>
      {chosenFile && (
        <div className="file-chosen-message">
          <span role="img" aria-label="selected" className="file-chosen-icon">✔️</span>
          <span className="file-chosen-name">{chosenFile}</span> selected
        </div>
      )}
    </>
  );
};

export default UploadForm;
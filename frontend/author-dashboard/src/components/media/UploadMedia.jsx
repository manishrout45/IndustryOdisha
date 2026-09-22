import React, { useState } from "react";
import { uploadMedia } from "../../services/mediaService";

const UploadMedia = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e?.preventDefault?.();
    if (!file) {
      alert("Please select a file.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", altText);
      formData.append("caption", caption);
      await uploadMedia(formData);
      setFile(null);
      setPreview("");
      setAltText("");
      setCaption("");
      const input = document.getElementById("media-file-input");
      if (input) input.value = "";
      onUpload?.();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="cms-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-ink">Upload media</h3>
        <p className="text-xs text-ink-muted mt-1">
          Photos for your stories
        </p>
      </div>

      <div>
        <label className="cms-label">File</label>
        <input
          id="media-file-input"
          type="file"
          accept="image/*"
          className="cms-input"
          onChange={(e) => {
            const next = e.target.files?.[0];
            setFile(next || null);
            setPreview(next ? URL.createObjectURL(next) : "");
          }}
        />
      </div>

      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-40 object-cover rounded-lg border"
        />
      ) : null}

      <div>
        <label className="cms-label">Alt text</label>
        <input
          className="cms-input"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
        />
      </div>

      <div>
        <label className="cms-label">Caption</label>
        <textarea
          rows={2}
          className="cms-input"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className="cms-btn-primary w-full">
        {loading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
};

export default UploadMedia;

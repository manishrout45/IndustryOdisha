import React, { useState } from "react";
import { uploadMedia } from "../../services/mediaService";

function UploadMedia({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e?.preventDefault?.();
    if (!file) {
      alert("Please select a file.");
      return;
    }

    try {
      setUploading(true);
      await uploadMedia(file, { altText, caption });
      setFile(null);
      setPreview("");
      setAltText("");
      setCaption("");
      const input = document.getElementById("media-file-input");
      if (input) input.value = "";
      onUploaded?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="cms-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-ink">Upload media</h3>
        <p className="text-xs text-ink-muted mt-1">
          Images for articles, homepage and ads
        </p>
      </div>

      <div>
        <label className="cms-label">File</label>
        <input
          id="media-file-input"
          type="file"
          accept="image/*,video/*"
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
          className="w-full h-40 object-cover rounded-lg border border-slate-200"
        />
      ) : null}

      <div>
        <label className="cms-label">Alt text</label>
        <input
          className="cms-input"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the image"
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

      <button type="submit" disabled={uploading} className="cms-btn-primary w-full">
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}

export default UploadMedia;

import React, { useEffect, useState } from "react";
import { getSeo, updateSeo } from "../../services/seoService";

function SeoSettings() {
  const [form, setForm] = useState({
    siteName: "",
    siteDescription: "",
    defaultMetaTitle: "",
    defaultMetaDescription: "",
    defaultOgImage: "",
    googleAnalyticsId: "",
    googleSearchConsole: "",
    robotsTxt: "",
    sitemapEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getSeo()
      .then((data) => {
        if (data) {
          setForm((prev) => ({
            ...prev,
            siteName: data.siteName || "",
            siteDescription: data.siteDescription || "",
            defaultMetaTitle: data.defaultMetaTitle || "",
            defaultMetaDescription: data.defaultMetaDescription || "",
            defaultOgImage: data.defaultOgImage || "",
            googleAnalyticsId: data.googleAnalyticsId || "",
            googleSearchConsole: data.googleSearchConsole || "",
            robotsTxt: data.robotsTxt || "",
            sitemapEnabled: data.sitemapEnabled !== false,
          }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      await updateSeo(form);
      setMessage("SEO settings saved.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="cms-card p-8 text-ink-muted">Loading SEO…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="cms-card p-6 space-y-5 max-w-3xl">
      <div>
        <h3 className="font-semibold text-ink">Site defaults</h3>
        <p className="text-sm text-ink-muted mt-1">
          Used when an article does not set its own SEO fields
        </p>
      </div>

      {[
        ["siteName", "Site name", "text"],
        ["siteDescription", "Site description", "textarea"],
        ["defaultMetaTitle", "Default meta title", "text"],
        ["defaultMetaDescription", "Default meta description", "textarea"],
        ["defaultOgImage", "Default OG image URL", "text"],
        ["googleAnalyticsId", "Google Analytics ID", "text"],
        ["googleSearchConsole", "Search Console verification", "text"],
      ].map(([name, label, type]) => (
        <div key={name}>
          <label className="cms-label">{label}</label>
          {type === "textarea" ? (
            <textarea
              name={name}
              rows={3}
              className="cms-input"
              value={form[name]}
              onChange={handleChange}
            />
          ) : (
            <input
              name={name}
              className="cms-input"
              value={form[name]}
              onChange={handleChange}
            />
          )}
        </div>
      ))}

      <div>
        <label className="cms-label">robots.txt</label>
        <textarea
          name="robotsTxt"
          rows={4}
          className="cms-input font-mono text-xs"
          value={form.robotsTxt}
          onChange={handleChange}
          placeholder="User-agent: *&#10;Allow: /"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="sitemapEnabled"
          checked={form.sitemapEnabled}
          onChange={handleChange}
        />
        Enable sitemap
      </label>

      {message ? (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={saving} className="cms-btn-primary">
        {saving ? "Saving…" : "Save SEO settings"}
      </button>
    </form>
  );
}

export default SeoSettings;

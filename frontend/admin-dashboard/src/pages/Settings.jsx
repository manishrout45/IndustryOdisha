import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import { getSeo, updateSeo } from "../services/seoService";

function Settings() {
  const [form, setForm] = useState({
    siteName: "Industry Odisha",
    siteDescription: "",
    supportEmail: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeo()
      .then((data) => {
        if (data) {
          setForm((prev) => ({
            ...prev,
            siteName: data.siteName || prev.siteName,
            siteDescription: data.siteDescription || "",
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        try {
          const raw = localStorage.getItem("adminSiteSettings");
          if (raw) {
            const local = JSON.parse(raw);
            setForm((prev) => ({
              ...prev,
              supportEmail: local.supportEmail || "",
              siteName: local.siteName || prev.siteName,
            }));
          }
        } catch {
          /* ignore */
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      await updateSeo({
        siteName: form.siteName,
        siteDescription: form.siteDescription,
      });
      localStorage.setItem(
        "adminSiteSettings",
        JSON.stringify({
          siteName: form.siteName,
          supportEmail: form.supportEmail,
        })
      );
      setMessage("Settings saved.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Site identity and newsroom shortcuts"
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 cms-card p-6 space-y-4"
        >
          {loading ? (
            <p className="text-ink-muted">Loading…</p>
          ) : (
            <>
              <div>
                <label className="cms-label">Site name</label>
                <input
                  className="cms-input"
                  value={form.siteName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, siteName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="cms-label">Site description</label>
                <textarea
                  rows={3}
                  className="cms-input"
                  value={form.siteDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      siteDescription: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="cms-label">Support email</label>
                <input
                  type="email"
                  className="cms-input"
                  value={form.supportEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, supportEmail: e.target.value }))
                  }
                />
              </div>
              {message ? (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  {message}
                </p>
              ) : null}
              <button type="submit" disabled={saving} className="cms-btn-primary">
                {saving ? "Saving…" : "Save settings"}
              </button>
            </>
          )}
        </form>

        <div className="lg:col-span-5 cms-card p-6">
          <h3 className="font-semibold text-ink mb-3">Newsroom tools</h3>
          <div className="grid gap-2">
            {[
              { to: "/seo", label: "SEO & metadata" },
              { to: "/advertisements", label: "Advertisements" },
              { to: "/homepage-builder", label: "Homepage builder" },
              { to: "/comments", label: "Comment moderation" },
              { to: "/media-library", label: "Media library" },
              { to: "/analytics", label: "Analytics" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium hover:border-ink hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;

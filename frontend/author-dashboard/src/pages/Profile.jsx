import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageUI";
import { getProfile, updateProfile } from "../services/profileService";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setFormData({
          name: profile?.name || "",
          email: profile?.email || "",
          bio: profile?.bio || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      await updateProfile(formData);
      setMessage("Profile updated successfully.");
      localStorage.setItem(
        "authorUser",
        JSON.stringify({
          ...(JSON.parse(localStorage.getItem("authorUser") || "{}")),
          name: formData.name,
          email: formData.email,
        })
      );
    } catch (error) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="cms-card p-10 text-center text-ink-muted">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Profile"
        subtitle="How you appear on bylines and the author desk"
      />

      <form onSubmit={handleSubmit} className="cms-card p-6 space-y-4">
        <div>
          <label className="cms-label">Full name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="cms-input"
          />
        </div>
        <div>
          <label className="cms-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="cms-input"
          />
        </div>
        <div>
          <label className="cms-label">Bio</label>
          <textarea
            rows="5"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="cms-input"
            placeholder="Short bio for your author page"
          />
        </div>

        {message ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            {message}
          </p>
        ) : null}

        <button type="submit" disabled={saving} className="cms-btn-primary">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;

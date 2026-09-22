import React, { useState } from "react";
import { Mail, X } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

export default function SubscribeModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setStatus("loading");
      setMessage("");
      const res = await axiosInstance.post("/newsletter/subscribe", {
        email: email.trim(),
      });
      setStatus("success");
      setMessage(
        res.data?.message ||
          "You’re subscribed! Daily top & trending news will arrive in your inbox."
      );
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(
        err?.response?.data?.message || "Could not subscribe. Try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-xl border border-slate-200 p-6 md:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 text-ink-muted"
          aria-label="Close subscribe"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent-softbg text-accent flex items-center justify-center">
            <Mail size={18} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Subscribe
            </h2>
            <p className="text-xs text-ink-muted">
              Daily top & trending headlines
            </p>
          </div>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed mb-5">
          Enter your email to receive Industry Odisha’s daily digest of top news
          and trending stories.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
              setMessage("");
            }}
            placeholder="you@example.com"
            className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-11 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-60"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe for free"}
          </button>
        </form>

        {message ? (
          <p
            className={`mt-3 text-sm ${
              status === "error" ? "text-red-600" : "text-emerald-700"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

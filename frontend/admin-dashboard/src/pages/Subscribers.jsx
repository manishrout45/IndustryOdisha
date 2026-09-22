import React, { useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";
import { PageHeader, EmptyState } from "../components/ui/PageUI";
import {
  getSubscribers,
  sendNewsletterNow,
} from "../services/newsletterService";

function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const list = await getSubscribers();
      setSubscribers(list);
    } catch (err) {
      console.error(err);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (
      !window.confirm(
        "Send today’s top & trending digest to all active subscribers now?"
      )
    ) {
      return;
    }
    try {
      setSending(true);
      const result = await sendNewsletterNow();
      alert(
        result?.message ||
          `Digest processed. Sent: ${result?.sent ?? 0}`
      );
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div>
      <PageHeader
        title="Newsletter"
        subtitle="Readers who subscribed for daily top & trending news"
        action={
          <button
            type="button"
            className="cms-btn-accent"
            onClick={handleSend}
            disabled={sending || activeCount === 0}
          >
            <Send size={16} />
            {sending ? "Sending…" : "Send digest now"}
          </button>
        }
      />

      <div className="cms-card p-4 mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 text-ink">
          <Mail size={16} className="text-accent" />
          <span>
            <strong>{activeCount}</strong> active · {subscribers.length} total
          </span>
        </div>
        <p className="text-ink-muted text-xs">
          Automatic send runs daily around 8:00 AM IST when SMTP is configured
          in the API <code>.env</code>.
        </p>
      </div>

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading subscribers…
        </div>
      ) : subscribers.length === 0 ? (
        <EmptyState
          title="No subscribers yet"
          description="When readers use Subscribe on the public site, they’ll appear here."
        />
      ) : (
        <div className="cms-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Subscribed</th>
                <th className="px-4 py-3 font-semibold">Last sent</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-ink">
                    {sub.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        sub.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sub.isActive ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {sub.subscribedAt
                      ? new Date(sub.subscribedAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {sub.lastSentAt
                      ? new Date(sub.lastSentAt).toLocaleString("en-IN")
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Subscribers;

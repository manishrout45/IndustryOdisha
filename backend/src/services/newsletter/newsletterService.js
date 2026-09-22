const Subscriber = require('../../models/newsletter/Subscriber');
const ApiError = require('../../utils/ApiError');
const { sendMail } = require('../../config/mailer');
const articleService = require('../breaking-news/articleService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscribe = async (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  let subscriber = await Subscriber.findOne({ email: normalized });
  if (subscriber) {
    if (!subscriber.isActive) {
      subscriber.isActive = true;
      subscriber.subscribedAt = new Date();
      await subscriber.save();
    }
    return subscriber;
  }

  subscriber = await Subscriber.create({ email: normalized });
  return subscriber;
};

const unsubscribe = async (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  const subscriber = await Subscriber.findOne({ email: normalized });
  if (!subscriber) throw new ApiError(404, 'Subscriber not found');
  subscriber.isActive = false;
  await subscriber.save();
  return subscriber;
};

const getSubscribers = async () =>
  Subscriber.find().sort({ createdAt: -1 });

const buildDigestHtml = (featured, trending, siteUrl) => {
  const renderList = (items, label) => {
    if (!items.length) return '';
    return `
      <h2 style="font-family:Georgia,serif;font-size:18px;margin:24px 0 12px;color:#0f172a;">
        ${label}
      </h2>
      <ul style="padding:0;margin:0;list-style:none;">
        ${items
          .map(
            (a) => `
          <li style="margin:0 0 14px;padding:0 0 14px;border-bottom:1px solid #e2e8f0;">
            <a href="${siteUrl}/article/${a.slug}" style="color:#0f172a;text-decoration:none;font-weight:700;font-size:16px;line-height:1.35;">
              ${a.title}
            </a>
            ${
              a.excerpt
                ? `<p style="margin:6px 0 0;color:#64748b;font-size:13px;line-height:1.5;">${a.excerpt.slice(0, 140)}${a.excerpt.length > 140 ? '…' : ''}</p>`
                : ''
            }
          </li>`
          )
          .join('')}
      </ul>`;
  };

  return `
  <div style="max-width:640px;margin:0 auto;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#0f172a;">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#b91c1c;font-weight:700;">
      Industry Odisha
    </p>
    <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 8px;">
      Today’s Top &amp; Trending
    </h1>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">
      Your daily briefing of featured and trending stories.
    </p>
    ${renderList(featured, 'Top news')}
    ${renderList(trending, 'Trending now')}
    <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;">
      You’re receiving this because you subscribed on Industry Odisha.
      <a href="${siteUrl}" style="color:#b91c1c;">Visit the site</a>
    </p>
  </div>`;
};

const sendDailyDigest = async () => {
  const siteUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(
    /\/$/,
    ''
  );

  const [featured, trending, subscribers] = await Promise.all([
    articleService.getFeaturedNews(5),
    articleService.getTrendingNews(5),
    Subscriber.find({ isActive: true }),
  ]);

  if (!subscribers.length) {
    return { sent: 0, message: 'No active subscribers' };
  }

  if (!featured.length && !trending.length) {
    return { sent: 0, message: 'No featured or trending articles to send' };
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subject = `Industry Odisha — Top & Trending · ${today}`;
  const html = buildDigestHtml(featured, trending, siteUrl);
  const text = [
    'Industry Odisha — Today’s Top & Trending',
    '',
    ...featured.map((a) => `Top: ${a.title} — ${siteUrl}/article/${a.slug}`),
    ...trending.map(
      (a) => `Trending: ${a.title} — ${siteUrl}/article/${a.slug}`
    ),
  ].join('\n');

  let sent = 0;
  for (const sub of subscribers) {
    await sendMail({ to: sub.email, subject, html, text });
    sub.lastSentAt = new Date();
    await sub.save();
    sent += 1;
  }

  return { sent, featured: featured.length, trending: trending.length };
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendDailyDigest,
};

/**
 * Sends the daily digest around 8:00 AM Asia/Kolkata once per calendar day.
 */
const newsletterService = require('../services/newsletter/newsletterService');

let lastSentKey = '';

const kolkataDateKey = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
  };
};

const maybeSendDailyDigest = async () => {
  try {
    const { dateKey, hour } = kolkataDateKey();
    if (hour < 8 || lastSentKey === dateKey) return;

    const result = await newsletterService.sendDailyDigest();
    lastSentKey = dateKey;
    console.log('[newsletter] Daily digest:', result);
  } catch (err) {
    console.error('[newsletter] Daily digest failed:', err.message);
  }
};

const startNewsletterScheduler = () => {
  maybeSendDailyDigest();
  setInterval(maybeSendDailyDigest, 15 * 60 * 1000);
  console.log('[newsletter] Scheduler started (checks every 15 min, sends ~8 AM IST)');
};

module.exports = { startNewsletterScheduler, maybeSendDailyDigest };

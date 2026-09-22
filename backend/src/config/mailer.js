const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const tx = getTransporter();
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'noreply@industryodisha.local';

  if (!tx) {
    console.log('[newsletter] SMTP not configured — email preview:');
    console.log({ to, subject, text: text || html?.slice(0, 200) });
    return { preview: true, to, subject };
  }

  return tx.sendMail({ from, to, subject, html, text });
};

module.exports = { getTransporter, sendMail };

import nodemailer from "nodemailer";

// Generic SMTP rather than a specific provider's API, so this works with
// whatever the family already has -- Gmail, Resend, Postmark, SES, a
// self-hosted mail server, all speak SMTP. See docs/EMAIL_SETUP.md.
export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!isEmailConfigured()) {
    throw new Error(
      "Email isn't configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, " +
        "and SMTP_FROM. See docs/EMAIL_SETUP.md."
    );
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await getTransporter().sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

const BRAND_GREEN = "#224b3f";
const BRAND_GOLD = "#b58a3a";
const BRAND_CREAM = "#fbf7ef";

function wrapTemplate(heading: string, bodyHtml: string) {
  return `
  <div style="background:${BRAND_CREAM};padding:32px;font-family:Arial,sans-serif;color:#2d2620;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #d9ccb8;border-radius:16px;overflow:hidden;">
      <div style="background:${BRAND_GREEN};color:#ffffff;padding:20px 24px;font-weight:bold;font-size:16px;">
        Christian Family Command Center
      </div>
      <div style="padding:24px;">
        <h1 style="font-size:20px;color:${BRAND_GREEN};margin:0 0 12px;">${heading}</h1>
        ${bodyHtml}
      </div>
    </div>
  </div>`;
}

export async function sendInviteEmail(opts: {
  to: string;
  inviterName: string;
  familyName: string;
  inviteUrl: string;
}) {
  const html = wrapTemplate(
    `You're invited to join the ${opts.familyName} family`,
    `<p style="font-size:14px;line-height:1.6;">${opts.inviterName} invited you to their family's
      private dashboard &mdash; a shared calendar and more. Click below to set up your own login.</p>
     <p style="margin:24px 0;">
       <a href="${opts.inviteUrl}" style="background:${BRAND_GREEN};color:#ffffff;text-decoration:none;
         padding:12px 20px;border-radius:999px;font-weight:bold;font-size:14px;">Accept invite</a>
     </p>
     <p style="font-size:12px;color:#6b5f4d;">This link expires in 14 days. If you weren't expecting
       this, you can safely ignore it.</p>`
  );
  const text = `${opts.inviterName} invited you to join the ${opts.familyName} family on Christian Family Command Center.\n\nAccept your invite: ${opts.inviteUrl}\n\nThis link expires in 14 days.`;

  await sendEmail({
    to: opts.to,
    subject: `You're invited to join the ${opts.familyName} family`,
    html,
    text,
  });
}

export async function sendPasswordResetEmail(opts: { to: string; resetUrl: string }) {
  const html = wrapTemplate(
    "Reset your password",
    `<p style="font-size:14px;line-height:1.6;">We got a request to reset the password on your
      account. Click below to choose a new one.</p>
     <p style="margin:24px 0;">
       <a href="${opts.resetUrl}" style="background:${BRAND_GOLD};color:#ffffff;text-decoration:none;
         padding:12px 20px;border-radius:999px;font-weight:bold;font-size:14px;">Reset password</a>
     </p>
     <p style="font-size:12px;color:#6b5f4d;">This link expires in 1 hour. If you didn't request
       this, you can safely ignore this email &mdash; your password won't change.</p>`
  );
  const text = `We got a request to reset your password.\n\nReset it here: ${opts.resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;

  await sendEmail({
    to: opts.to,
    subject: "Reset your password",
    html,
    text,
  });
}

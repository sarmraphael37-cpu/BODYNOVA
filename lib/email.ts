import "server-only";
import nodemailer from "nodemailer";
import { getBrevoConfig, getSiteUrl, isBrevoConfigured } from "@/lib/env";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (!transport) {
    const config = getBrevoConfig();
    transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
  return transport;
}

/**
 * Sends a transactional email through Brevo SMTP. No-ops when Brevo is not
 * configured so the app keeps working before credentials are added.
 */
export async function sendEmail({ to, subject, text, html }: EmailPayload): Promise<void> {
  if (!isBrevoConfigured()) {
    console.warn(`[email] Brevo SMTP is not configured; skipping "${subject}" to ${to}.`);
    return;
  }

  const config = getBrevoConfig();
  await getTransport().sendMail({
    from: `"${config.fromName}" <${config.from}>`,
    to,
    subject,
    text,
    html,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderBaseLayout(options: {
  preheader: string;
  title: string;
  bodyHtml: string;
}): string {
  const { preheader, title, bodyHtml } = options;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(2, 6, 23, 0.08);">
            <tr>
              <td style="background: linear-gradient(135deg, #0f766e 0%, #10b981 100%); padding: 40px 40px 32px;">
                <div style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">BodyNova</div>
                <div style="font-size: 13px; color: rgba(255, 255, 255, 0.85); margin-top: 4px;">Your smart body fitness tracker</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;">
                <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                  You are receiving this email because you have an account with BodyNova.
                  <br />
                  <a href="${escapeHtml(getSiteUrl())}" style="color: #0f766e; text-decoration: none; font-weight: 600;">BodyNova Fitness</a>
                  &middot; Train smart, live stronger.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 28px;">
    <tr>
      <td style="border-radius: 10px; background-color: #0f766e;">
        <a href="${escapeHtml(href)}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export async function sendWelcomeEmail(to: string, fullName: string): Promise<void> {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";
  const siteUrl = getSiteUrl();
  const subject = "Welcome to BodyNova — you're in! 💪";

  const bodyHtml = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
      Thank you very much, ${escapeHtml(firstName)}!
    </h1>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #334155;">
      You have successfully created your account in <strong style="color: #0f766e;">BodyNova</strong> — your smart
      body fitness tracker. We&rsquo;re genuinely thrilled to have you on the team.
    </p>
    <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7; color: #334155;">
      Here&rsquo;s what&rsquo;s waiting for you:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 8px 0 0;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #334155;">
          <span style="color: #0f766e; font-weight: 700;">&check;</span> Track your workouts, weight, sleep &amp; water in one place
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #334155;">
          <span style="color: #0f766e; font-weight: 700;">&check;</span> Smart goals and a personal AI coach by your side
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #334155;">
          <span style="color: #0f766e; font-weight: 700;">&check;</span> Progress insights that keep you motivated, every day
        </td>
      </tr>
    </table>
    ${ctaButton(`${siteUrl}/login`, "Start your journey")}
    <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.7; color: #64748b;">
      If you haven&rsquo;t confirmed your email yet, check your inbox for a verification link so your account is fully activated.
    </p>
    <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.7; color: #64748b;">
      See you at your first workout!<br />
      The BodyNova team
    </p>
  `;

  await sendEmail({
    to,
    subject,
    text: `Thank you very much, ${firstName}!\n\nYou have successfully created your account in BodyNova — your smart body fitness tracker. We're thrilled to have you.\n\nStart your journey: ${siteUrl}/login`,
    html: renderBaseLayout({
      preheader: "Thank you very much! Your BodyNova account is ready.",
      title: "Welcome to BodyNova",
      bodyHtml,
    }),
  });
}

export async function sendPasswordResetCode(to: string, code: string): Promise<void> {
  const subject = "Your BodyNova password reset code";

  const bodyHtml = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
      Reset your password
    </h1>
    <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7; color: #334155;">
      Use the code below to set a new password for your BodyNova account. It expires in
      <strong style="color: #0f766e;">15 minutes</strong>.
    </p>
    <div style="margin: 24px 0; padding: 20px; background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; text-align: center;">
      <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #0f766e;">${escapeHtml(code)}</div>
    </div>
    <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #64748b;">
      If you didn&rsquo;t request this, you can safely ignore this email and your password
      will stay unchanged.
    </p>
  `;

  await sendEmail({
    to,
    subject,
    text: `Your BodyNova password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can safely ignore this email.`,
    html: renderBaseLayout({
      preheader: "Your BodyNova password reset code",
      title: "Reset your password",
      bodyHtml,
    }),
  });
}

import nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "./logger";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const hasSmtpConfig = Boolean(env.email.host && env.email.user && env.email.pass);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: { user: env.email.user, pass: env.email.pass },
    })
  : null;

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!transporter) {
    // Dev fallback: no SMTP configured yet — log instead of failing,
    // so password reset flows are still testable before mail is wired up.
    logger.warn(`[email:dev-fallback] Would send to ${to} — "${subject}"`);
    logger.warn(`[email:dev-fallback] ${html}`);
    return;
  }

  await transporter.sendMail({
    from: env.email.from,
    to,
    subject,
    html,
  });
}
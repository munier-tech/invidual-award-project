import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || smtpUser || 'noreply@localhost';

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export const sendPasswordResetEmail = async (to, resetLink) => {
  if (!transporter) {
    return { sent: false, reason: 'SMTP not configured' };
  }

  await transporter.sendMail({
    from: emailFrom,
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1f2937;">Password Reset</h2>
        <p style="color: #4b5563;">Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">If you didn’t request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
};

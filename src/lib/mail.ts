import nodemailer from 'nodemailer';

interface SendResetEmailOptions {
  to: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendResetEmailOptions): Promise<{ success: boolean; error?: string }> {
  const mailHost = process.env.MAIL_HOST;
  const mailPort = parseInt(process.env.MAIL_PORT || '587', 10);
  const mailSecure = process.env.MAIL_SECURE === 'true' || mailPort === 465;
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  // Always log reset URL in non-production or when explicitly debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n======================================================`);
    console.log(`[PASSWORD RESET LINK for ${to}]`);
    console.log(`URL: ${resetUrl}`);
    console.log(`======================================================\n`);
  }

  if (!mailHost || !mailUser || !mailPass) {
    console.warn('[Mail] SMTP configuration missing. Fallback link logged to console.');
    return { success: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailSecure,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #8B1E2D; font-size: 24px; margin: 0; font-weight: 800;">PrintPortal</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Official PVC Card Printing Studio</p>
        </div>

        <div style="background-color: #ffffff; padding: 32px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #1D3557; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
            Hello <strong>${name || 'Operator'}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            We received a request to reset your password for your PrintPortal account. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #8B1E2D 0%, #E63946 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-top: 24px; word-break: break-all;">
            If the button doesn't work, copy and paste this URL into your browser:<br />
            <a href="${resetUrl}" style="color: #457B9D;">${resetUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} PrintPortal. All rights reserved.
        </div>
      </div>
    `;

    const textContent = `
Hello ${name || 'Operator'},

We received a request to reset your password for your PrintPortal account.

To reset your password, visit the link below (valid for 1 hour):
${resetUrl}

If you did not request this reset, you can safely ignore this email.
    `.trim();

    await transporter.sendMail({
      from: `"PrintPortal Security" <${mailUser}>`,
      to,
      subject: 'Reset your PrintPortal password',
      text: textContent,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Mail] Failed to send password reset email via SMTP:', err.message);
    // Still return success to prevent leaking internal mail server failure details to public clients
    return { success: false, error: err.message };
  }
}

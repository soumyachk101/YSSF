import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@youthsakti.org";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateVerificationToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function sendOTPEmail(email: string, name: string, otp: string): Promise<boolean> {
  try {
    if (!SMTP_USER) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return true;
    }

    await transporter.sendMail({
      from: `"Youth Sakti Social Foundation" <${FROM_EMAIL}>`,
      to: email,
      subject: "YSSF - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0B5D3B, #1a7a52); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Youth Sakti Social Foundation</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <h2 style="color: #0B5D3B; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #374151;">Hello ${name},</p>
            <p style="color: #374151;">Your verification code is:</p>
            <div style="background: white; border: 2px dashed #0B5D3B; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0B5D3B;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

export async function sendVerificationLinkEmail(email: string, name: string, token: string): Promise<boolean> {
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify?token=${token}`;

  try {
    if (!SMTP_USER) {
      console.log(`[DEV] Verification link for ${email}: ${verifyUrl}`);
      return true;
    }

    await transporter.sendMail({
      from: `"Youth Sakti Social Foundation" <${FROM_EMAIL}>`,
      to: email,
      subject: "YSSF - Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0B5D3B, #1a7a52); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Youth Sakti Social Foundation</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <h2 style="color: #0B5D3B; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #374151;">Hello ${name},</p>
            <p style="color: #374151;">Click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background: #0B5D3B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours. If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send verification link email:", error);
    return false;
  }
}

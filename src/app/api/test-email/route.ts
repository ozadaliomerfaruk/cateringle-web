import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  // Environment variables kontrolü
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return NextResponse.json({
      success: false,
      error: "SMTP credentials missing",
      hasUser: !!smtpUser,
      hasPass: !!smtpPass,
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // SMTP bağlantısını doğrula
    await transporter.verify();

    // Test maili gönder
    const info = await transporter.sendMail({
      from: `Cateringle Test <${smtpUser}>`,
      to: smtpUser, // Kendine gönder
      subject: "Cateringle SMTP Test - " + new Date().toISOString(),
      html: "<h1>SMTP Çalışıyor!</h1><p>Bu bir test mailidir.</p>",
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      smtpUser: smtpUser,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
}

import { NextResponse } from 'next/server';
import { getData } from '@/lib/data';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    let customSubject = '';
    let customMessage = '';
    try {
      const body = await request.json();
      customSubject = body.subject;
      customMessage = body.message;
    } catch (e) {
      // ignore JSON parse error if body is empty
    }

    const data = await getData();
    const registrations = data.registrations;
    const settings = data.settings;

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ success: false, message: 'No users registered yet.' }, { status: 400 });
    }

    // Configure Nodemailer transporter based on .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_PORT == '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Check if credentials are set (very naive check, just to log a nice message if not)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("WARNING: SMTP_USER or SMTP_PASS is missing in your environment variables. Emails will fail if using default SMTP parameters.");
    }

    const emailPromises = registrations.map(async (user) => {
      let finalSubject = customSubject;
      let finalHtmlContent = '';

      if (customSubject && customMessage) {
        // Use custom reminder message, convert \n to <br> and wrap in basic styling
        const messageHtml = customMessage.replace(/\n/g, '<br/>');
        finalHtmlContent = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
            <div>${messageHtml}</div>
          </div>
        `;
      } else {
        // Fallback default format
        finalSubject = "Your Workshop Details - E-waste Initiative";
        finalHtmlContent = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
            <h2 style="color: #2e7d32;">Hello ${user.fullName},</h2>
            <p>Thank you for registering for the <strong>E-waste Awareness Workshop</strong>!</p>
            
            <div style="background-color: #f4f9f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${settings.date}</p>
              <p style="margin: 5px 0;"><strong>🕓 Time:</strong> ${settings.time}</p>
              <p style="margin: 5px 0;"><strong>🔗 Join Link:</strong> <a href="${settings.link}">${settings.link}</a></p>
            </div>
            
            <p>Please join 5 minutes early so we can start exactly on time. We look forward to seeing you there!</p>
            <br>
            <p>Best Regards,</p>
            <p><strong>Team ProSAR</strong></p>
          </div>
        `;
      }

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"E-waste Workshop" <noreply@ewasteworkshop.com>',
          to: user.email,
          subject: finalSubject,
          html: finalHtmlContent,
        });
      } catch (err) {
        console.error(`Failed to send email to ${user.email}`, err);
        throw err;
      }
    });

    // Await all email dispatches uniformly
    await Promise.all(emailPromises);

    return NextResponse.json({ success: true, message: `Successfully emailed workshop details to ${registrations.length} registered users!` });
  } catch (error) {
    console.error('Email Dispatch Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send notifications. Make sure your .env has active SMTP credentials.' }, { status: 500 });
  }
}

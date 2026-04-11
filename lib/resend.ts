import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface TicketEmailParams {
  to: string;
  eventName: string;
  venue: string;
  date: string;
  qrUuid: string;
  ticketId: string;
}

export async function sendTicketConfirmation({
  to,
  eventName,
  venue,
  date,
  qrUuid,
  ticketId,
}: TicketEmailParams) {
  try {
    const { error } = await resend.emails.send({
      from: "Emperia Experiences <onboarding@resend.dev>",
      to: [to],
      subject: `Your Ticket — ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background: #131313; color: #E5E2E1; font-family: 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 500px; margin: 0 auto; padding: 40px 24px; }
            .logo { text-align: center; margin-bottom: 32px; }
            .logo-circle { display: inline-flex; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #F2CA50, #D4AF37); align-items: center; justify-content: center; }
            .logo-text { color: #3C2F00; font-weight: bold; font-size: 16px; }
            .card { background: #1c1b1b; border-radius: 16px; overflow: hidden; }
            .card-header { background: linear-gradient(135deg, #1a0533, #2d1052); padding: 32px 24px; text-align: center; }
            .card-header h1 { margin: 0 0 8px; font-size: 24px; font-weight: 400; color: #E5E2E1; }
            .card-header p { margin: 0; font-size: 13px; color: #D0C5AF; }
            .tear { display: flex; align-items: center; padding: 0 12px; height: 24px; }
            .tear-circle { width: 12px; height: 24px; background: #131313; }
            .tear-left { border-radius: 0 12px 12px 0; }
            .tear-right { border-radius: 12px 0 0 12px; }
            .tear-line { flex: 1; border-top: 1px dashed #4D4635; margin: 0 8px; }
            .card-body { padding: 24px; text-align: center; }
            .qr-label { font-size: 10px; color: #D0C5AF; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
            .qr-code { font-size: 14px; color: #F2CA50; word-break: break-all; margin-bottom: 16px; }
            .ticket-id { font-size: 10px; color: rgba(208, 197, 175, 0.4); letter-spacing: 0.15em; text-transform: uppercase; }
            .info { margin-top: 24px; text-align: left; padding: 16px; background: #201f1f; border-radius: 12px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
            .info-label { color: #D0C5AF; }
            .info-value { color: #E5E2E1; }
            .footer { text-align: center; padding: 32px 24px; font-size: 11px; color: rgba(208, 197, 175, 0.4); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <div class="logo-circle">
                <span class="logo-text">E</span>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h1>${eventName}</h1>
                <p>${venue}${date ? ` · ${date}` : ""}</p>
              </div>

              <div class="tear">
                <div class="tear-circle tear-left"></div>
                <div class="tear-line"></div>
                <div class="tear-circle tear-right"></div>
              </div>

              <div class="card-body">
                <p class="qr-label">Your Ticket QR Code</p>
                <p class="qr-code">${qrUuid}</p>
                <p class="ticket-id">Ticket ID: ${ticketId}</p>

                <div class="info">
                  <div class="info-row">
                    <span class="info-label">Event</span>
                    <span class="info-value">${eventName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Venue</span>
                    <span class="info-value">${venue}</span>
                  </div>
                  ${date ? `<div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>` : ""}
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Present this QR code at the venue entrance for scanning.</p>
              <p style="margin-top: 16px;">© ${new Date().getFullYear()} Emperia Experiences. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Resend] Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[Resend] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Email send failed." };
  }
}

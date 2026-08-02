import "server-only";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "#SAINTEMAXIME <contact@hashtagsaintemaxime.fr>";

export async function sendShippingEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY non configurée, email d'expédition non envoyé.");
    return { skipped: true };
  }

  const { customerName, orderNumber, trackingNumber, carrier, trackingUrl } = params;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Ta commande ${orderNumber} est en route ! 📦 — #SAINTEMAXIME®`,
    html: `
      <div style="background-color:#f0fdff;padding:40px 20px;font-family:Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#00D4E8,#FF6B8A);padding:32px 24px;text-align:center;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">#SAINTEMAXIME</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="font-size:20px;color:#1E293B;margin:0 0 16px;">C'est parti, ${customerName} ! 📦</h1>
              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 20px;">
                Ta commande <strong>${orderNumber}</strong> vient d'être expédiée par <strong>${carrier}</strong>.
              </p>
              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px;">
                Numéro de suivi : <strong>${trackingNumber}</strong>
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                <tr>
                  <td style="border-radius:999px;background:#00D4E8;">
                    <a href="${trackingUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Suivre ma commande
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;text-align:center;">
              <p style="font-size:12px;color:#94A3B8;margin:0;">#SAINTEMAXIME® — Sainte-Maxime, France</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
}

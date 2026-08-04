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

export async function sendNewsletterWelcomeEmail(params: { to: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY non configurée, email de bienvenue newsletter non envoyé.");
    return { skipped: true };
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Ton code -10% t'attend ! 🎁 — #SAINTEMAXIME®",
    html: `
      <div style="background-color:#f0fdff;padding:40px 20px;font-family:Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#00D4E8,#FF6B8A);padding:32px 24px;text-align:center;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">#SAINTEMAXIME</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;text-align:center;">
              <h1 style="font-size:20px;color:#1E293B;margin:0 0 16px;">Bienvenue dans la Family ! 🎉</h1>
              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px;">
                Merci de t'être inscrit·e à notre newsletter. Voici ton code de bienvenue, valable sur ta prochaine commande :
              </p>
              <div style="background:#f0fdff;border:2px dashed #00D4E8;border-radius:16px;padding:20px;margin:0 0 24px;">
                <p style="font-size:12px;color:#64748B;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Ton code</p>
                <p style="font-size:28px;font-weight:800;color:#00D4E8;margin:0;letter-spacing:2px;">NEWSLETTER10</p>
                <p style="font-size:13px;color:#64748B;margin:8px 0 0;">-10% sur ta commande</p>
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:999px;background:#FF6B8A;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://hashtagsaintemaxime.fr"}/boutique/" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Découvrir la boutique
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

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  trackingUrl: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY non configurée, email de confirmation non envoyé.");
    return { skipped: true };
  }

  const { customerName, orderNumber, items, total, trackingUrl } = params;
  const itemsHtml = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;font-size:14px;color:#1E293B;">${i.name} × ${i.qty}</td><td style="padding:6px 0;font-size:14px;color:#1E293B;text-align:right;">${(i.price * i.qty).toFixed(2)}€</td></tr>`
    )
    .join("");

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Confirmation de ta commande ${orderNumber} ✅ — #SAINTEMAXIME®`,
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
              <h1 style="font-size:20px;color:#1E293B;margin:0 0 8px;">Merci ${customerName} ! ✅</h1>
              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 20px;">
                Ta commande <strong>${orderNumber}</strong> est confirmée et en cours de préparation.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;margin:0 0 16px;">
                ${itemsHtml}
              </table>
              <p style="font-size:16px;font-weight:700;color:#00D4E8;text-align:right;margin:0 0 24px;">Total : ${total.toFixed(2)}€</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
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

export async function sendProcessingEmail(params: { to: string; customerName: string; orderNumber: string; trackingUrl: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY non configurée, email de préparation non envoyé.");
    return { skipped: true };
  }

  const { customerName, orderNumber, trackingUrl } = params;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Ta commande ${orderNumber} est en préparation 📦 — #SAINTEMAXIME®`,
    html: `
      <div style="background-color:#f0fdff;padding:40px 20px;font-family:Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#00D4E8,#FF6B8A);padding:32px 24px;text-align:center;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">#SAINTEMAXIME</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;text-align:center;">
              <h1 style="font-size:20px;color:#1E293B;margin:0 0 16px;">${customerName}, on prépare ta commande ! 📦</h1>
              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px;">
                Ta commande <strong>${orderNumber}</strong> est en cours de préparation avec soin. On te préviendra dès qu'elle part.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:999px;background:#FF6B8A;">
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

export async function sendReviewRequestEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: { name: string; slug?: string }[];
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY non configurée, email de demande d'avis non envoyé.");
    return { skipped: true };
  }

  const { customerName, orderNumber, orderDate, items } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hashtagsaintemaxime.fr";
  const itemsHtml = items
    .map((i) => {
      const link = i.slug ? `${baseUrl}/produit/${i.slug}/` : `${baseUrl}/boutique/`;
      return `<tr><td style="padding:8px 0;"><a href="${link}" style="font-size:14px;color:#00D4E8;text-decoration:none;font-weight:600;">${i.name} →</a></td></tr>`;
    })
    .join("");

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `${customerName}, ton avis compte pour nous ! ⭐ — #SAINTEMAXIME®`,
    html: `
      <div style="background-color:#f0fdff;padding:40px 20px;font-family:Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#00D4E8,#FF6B8A);padding:32px 24px;text-align:center;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">#SAINTEMAXIME</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;text-align:center;">
              <h1 style="font-size:20px;color:#1E293B;margin:0 0 16px;">Alors, ça donne quoi ? ⭐</h1>
              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 8px;">
                ${customerName}, ta commande devrait être arrivée depuis quelques jours. On adorerait savoir ce que tu en penses !
              </p>
              <p style="font-size:12px;color:#94A3B8;margin:0 0 24px;">
                Commande ${orderNumber} du ${orderDate}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="text-align:left;margin:0 0 24px;">
                ${itemsHtml}
              </table>
              <p style="font-size:13px;color:#64748B;margin:0;">
                Clique sur un produit ci-dessus pour laisser ton avis directement sur sa page.
              </p>
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

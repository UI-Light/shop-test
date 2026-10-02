import { formatPrice } from "./format";

/**
 * Sends the order confirmation email through Mailgun's HTTP API.
 *
 * This file is server-side only. The Mailgun credentials come from environment
 * variables with no NEXT_PUBLIC_ prefix, which is what stops Next.js from ever
 * sending them to the browser. Only import this from a server file such as a
 * "use server" action.
 *
 * Mailgun in one line: POST to /v3/<your domain>/messages with form fields,
 * signed with HTTP basic auth where the username is the literal word "api" and
 * the password is your API key.
 */

/** The US region. An account in the EU region sets MAILGUN_API_BASE instead. */
const US_API_BASE = "https://api.mailgun.net";

/** The name shown in the inbox, e.g. "Shop <shop@sandbox...>". */
const SENDER_NAME = "Shop";

/** Everything the email needs to know about the order. */
export type OrderEmail = {
  to: string;
  /** The shopper's name, if Google gave us one. */
  name?: string | null;
  orderId: string;
  totalCents: number;
  lines: { name: string; quantity: number; priceCents: number }[];
  /** Link back to the confirmation page, when we know the site's address. */
  orderUrl?: string;
};

/** The result of trying to send. Nothing here is ever thrown. */
export type SendResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Escapes text going into the HTML part of the email, so a product called
 * "Tea & <Co>" cannot break the markup.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the plain-text version of the email. */
function buildText(email: OrderEmail): string {
  const greeting = email.name ? `Hi ${email.name},` : "Hi,";
  const itemLines = email.lines.map(
    (line) =>
      `${line.quantity} x ${line.name} - ${formatPrice(
        line.priceCents * line.quantity,
      )}`,
  );

  return [
    greeting,
    "",
    "Thanks for your order. Here is what you bought:",
    "",
    ...itemLines,
    "",
    `Total: ${formatPrice(email.totalCents)}`,
    `Order: #${email.orderId.slice(0, 8)}`,
    ...(email.orderUrl ? [`View your order: ${email.orderUrl}`] : []),
    "",
    "This is a practice shop, so nothing was charged and nothing will ship.",
    "",
    "-- Shop",
  ].join("\n");
}

/** Builds the HTML version of the email, for people who read rich mail. */
function buildHtml(email: OrderEmail): string {
  const greeting = email.name ? `Hi ${escapeHtml(email.name)},` : "Hi,";

  const itemRows = email.lines
    .map(
      (line) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
            ${escapeHtml(line.name)}
            <span style="color:#64748b;">&times; ${line.quantity}</span>
          </td>
          <td align="right" style="padding:8px 0;border-bottom:1px solid #e2e8f0;white-space:nowrap;">
            ${formatPrice(line.priceCents * line.quantity)}
          </td>
        </tr>`,
    )
    .join("");

  const button = email.orderUrl
    ? `<p style="margin:16px 0 0;">
         <a href="${escapeHtml(email.orderUrl)}"
            style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">
           View your order
         </a>
       </p>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;">Thanks for your order</h1>
      <p style="margin:0 0 24px;color:#475569;">${greeting}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px;">
        ${itemRows}
        <tr>
          <td style="padding:12px 0;font-weight:600;">Total</td>
          <td align="right" style="padding:12px 0;font-weight:600;white-space:nowrap;">
            ${formatPrice(email.totalCents)}
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0;color:#64748b;font-size:14px;">
        Order #${email.orderId.slice(0, 8)}
      </p>
      ${button}
      <p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;">
        This is a practice shop, so nothing was charged and nothing will ship.
      </p>
    </div>
  </body>
</html>`;
}


/**
 * Sends one confirmation email.
 *
 * This function never throws and never rejects - it always hands back a
 * result. A confirmation email that fails to send must never be able to fail
 * the customer's order.
 */
export async function sendOrderConfirmation(
  email: OrderEmail,
): Promise<SendResult> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    return { ok: false, error: "MAILGUN_API_KEY or MAILGUN_DOMAIN is not set" };
  }

  // EU accounts set MAILGUN_API_BASE; US accounts fall back to the default.
  const base = (process.env.MAILGUN_API_BASE || US_API_BASE).replace(/\/+$/, "");
  const from = `${SENDER_NAME} <shop@${domain}>`;

  // FormData makes fetch send multipart/form-data, which is what Mailgun wants.
  const body = new FormData();
  body.set("from", from);
  body.set("to", email.to);
  body.set("subject", `Your Shop order #${email.orderId.slice(0, 8)}`);
  body.set("text", buildText(email));
  body.set("html", buildHtml(email));

  try {
    const response = await fetch(`${base}/v3/${domain}/messages`, {
      method: "POST",
      // Basic auth: the username is the word "api", the password is the API
      // key from Account -> API Keys in the Mailgun dashboard.
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      },
      body,
    });

    const raw = await response.text();

    if (!response.ok) {
      // Mailgun explains itself in the body, e.g. "'to' is not an authorized
      // recipient" on a sandbox domain. Passing that on makes debugging easy.
      return {
        ok: false,
        error: `Mailgun said ${response.status}: ${raw.slice(0, 300)}`,
      };
    }

    // A success looks like { "id": "<...>", "message": "Queued. Thank you." }
    const id = (JSON.parse(raw) as { id?: string }).id ?? "unknown";
    return { ok: true, id };
  } catch (error) {
    // A network failure, or Mailgun being unreachable. Same rule: report it,
    // never throw.
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

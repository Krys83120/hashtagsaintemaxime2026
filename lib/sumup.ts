const SUMUP_API_URL = "https://api.sumup.com/v0.1";

function getCredentials() {
  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;
  if (!apiKey || !merchantCode) {
    throw new Error("SUMUP_API_KEY et SUMUP_MERCHANT_CODE doivent être configurés.");
  }
  return { apiKey, merchantCode };
}

export interface CreateSumupCheckoutParams {
  checkoutReference: string;
  amount: number;
  description: string;
  redirectUrl: string;
}

export async function createSumupCheckout(params: CreateSumupCheckoutParams) {
  const { apiKey, merchantCode } = getCredentials();

  const res = await fetch(`${SUMUP_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checkout_reference: params.checkoutReference,
      amount: Math.round(params.amount * 100) / 100,
      currency: "EUR",
      merchant_code: merchantCode,
      description: params.description,
      redirect_url: params.redirectUrl,
      hosted_checkout: { enabled: true },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error_message || `Erreur SumUp (${res.status})`);
  }

  return data as { id: string; status: string; hosted_checkout_url?: string };
}

export async function getSumupCheckout(checkoutId: string) {
  const { apiKey } = getCredentials();

  const res = await fetch(`${SUMUP_API_URL}/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error_message || `Erreur SumUp (${res.status})`);
  }

  return data as { id: string; status: "PENDING" | "PAID" | "FAILED" | "EXPIRED"; checkout_reference: string };
}

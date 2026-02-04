import { getApiUrl, parseApiError } from "@/lib/api";
import type { CartItem } from "@/types";

interface CheckoutCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
}

interface CheckoutSessionPayload {
  items: CartItem[];
  customer: CheckoutCustomer;
}

interface CheckoutSessionResponse {
  url?: string;
}

export const redirectToStripeCheckout = async (payload: CheckoutSessionPayload) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response: Response;

  try {
    response = await fetch(getApiUrl("/api/stripe/create-checkout-session"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Checkout request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to create Stripe checkout session.");
    throw new Error(message);
  }

  const data = (await response.json()) as CheckoutSessionResponse;

  if (!data.url) {
    throw new Error("Stripe API must return a checkout URL.");
  }

  window.location.assign(data.url);
};

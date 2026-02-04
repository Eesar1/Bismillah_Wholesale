import { getApiUrl, parseApiError } from "@/lib/api";
import type { CartItem } from "@/types";

type OfflinePaymentMethod = "cod" | "jazzcash" | "easypaisa";

interface OfflineOrderPayload {
  items: CartItem[];
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
  };
  paymentMethod: OfflinePaymentMethod;
}

interface OfflineOrderResponse {
  orderId: string;
}

export const submitOfflineOrder = async (payload: OfflineOrderPayload) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/orders/offline"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Order request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to submit order.");
    throw new Error(message);
  }

  return (await response.json()) as OfflineOrderResponse;
};

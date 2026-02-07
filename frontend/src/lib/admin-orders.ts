import { getApiUrl, parseApiError } from "@/lib/api";
import type { CartItem, CustomerInfo } from "@/types";

export type PaymentMethod = "card" | "cod" | "jazzcash" | "easypaisa";
export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "shipping"
  | "shipped"
  | "completed"
  | "cancelled";

export interface AdminOrder {
  id: string;
  paymentMethod: PaymentMethod;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

interface OrdersResponse {
  orders: AdminOrder[];
}

interface UpdateOrderResponse {
  order: AdminOrder;
}

export const listOrders = async () => {
  const response = await fetch(getApiUrl("/api/orders"), {
    method: "GET",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load orders.");
    throw new Error(message);
  }

  return (await response.json()) as OrdersResponse;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const response = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to update order status.");
    throw new Error(message);
  }

  return (await response.json()) as UpdateOrderResponse;
};

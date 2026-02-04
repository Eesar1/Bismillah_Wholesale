import { getApiUrl, parseApiError } from "@/lib/api";

export interface ProductAvailability {
  inStock: boolean;
  stockQuantity: number;
}

interface ProductAvailabilityResponse {
  availability: Record<string, ProductAvailability>;
}

export const fetchProductAvailability = async () => {
  const response = await fetch(getApiUrl("/api/products/availability"));

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to fetch product availability.");
    throw new Error(message);
  }

  return (await response.json()) as ProductAvailabilityResponse;
};

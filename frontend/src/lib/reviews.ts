import { getApiUrl, parseApiError } from "@/lib/api";

export interface ProductReview {
  id: string;
  productId: string;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RatingSummary {
  average: number;
  count: number;
}

export interface ReviewsResponse {
  reviews: ProductReview[];
  summary: RatingSummary;
}

export const fetchProductReviews = async (productId: string) => {
  const response = await fetch(getApiUrl(`/api/products/${productId}/reviews`), {
    method: "GET",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load reviews.");
    throw new Error(message);
  }

  return (await response.json()) as ReviewsResponse;
};

export const submitProductReview = async (
  productId: string,
  payload: { name: string; email?: string; rating: number; comment: string }
) => {
  const response = await fetch(getApiUrl(`/api/products/${productId}/reviews`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to submit review.");
    throw new Error(message);
  }

  return (await response.json()) as { review: ProductReview; summary: RatingSummary };
};

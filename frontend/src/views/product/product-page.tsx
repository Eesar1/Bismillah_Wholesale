import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import Wrapper from "@/components/wrapper";
import { getProductBySlug, products } from "@/data/products";
import { useCart } from "@/hooks/use-cart";
import { formatPkr } from "@/lib/currency";
import { fetchProductAvailability } from "@/lib/product-availability";
import { fetchProductReviews, submitProductReview, type ProductReview, type RatingSummary } from "@/lib/reviews";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const baseProduct = useMemo(() => (slug ? getProductBySlug(slug) : undefined), [slug]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, { inStock: boolean; stockQuantity: number }>>({});
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<RatingSummary>({ average: 0, count: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"gallery" | "spin">("gallery");
  const dragStartXRef = useRef<number | null>(null);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });

  const product: Product | undefined = useMemo(() => {
    if (!baseProduct) return undefined;
    const liveAvailability = availabilityMap[baseProduct.id];
    return liveAvailability
      ? { ...baseProduct, inStock: liveAvailability.inStock, stockQuantity: liveAvailability.stockQuantity }
      : baseProduct;
  }, [availabilityMap, baseProduct]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0 ? product.images : [product.image];
  }, [product]);

  const spinImages = useMemo(() => {
    if (!product?.spinImages) return [];
    return product.spinImages;
  }, [product]);

  const currentImages = useMemo(() => {
    if (viewMode === "spin" && spinImages.length > 0) {
      return spinImages;
    }
    return galleryImages;
  }, [galleryImages, spinImages, viewMode]);

  useEffect(() => {
    let isMounted = true;

    const loadAvailability = async () => {
      try {
        const data = await fetchProductAvailability();
        if (isMounted) {
          setAvailabilityMap(data.availability || {});
        }
      } catch (error) {
        console.error("Product availability fetch failed:", error);
      }
    };

    void loadAvailability();
    const interval = window.setInterval(loadAvailability, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      if (!baseProduct) return;
      setIsLoadingReviews(true);
      setReviewError(null);
      try {
        const data = await fetchProductReviews(baseProduct.id);
        if (isMounted) {
          setReviews(data.reviews);
          setSummary(data.summary);
        }
      } catch (error) {
        setReviewError(error instanceof Error ? error.message : "Failed to load reviews.");
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false);
        }
      }
    };

    void loadReviews();
    const interval = window.setInterval(loadReviews, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [baseProduct]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsTransitioning(false);
    setIsReady(false);
    setActiveImageIndex(0);
    setViewMode("gallery");
    const timer = window.setTimeout(() => setIsReady(true), 40);
    return () => window.clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [viewMode]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
  };

  const handleNavigateToSlug = (targetSlug: string) => {
    if (targetSlug === slug) return;
    setIsTransitioning(true);
    window.setTimeout(() => {
      navigate(`/product/${targetSlug}`);
    }, 160);
  };

  const handlePointerDown = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const clientX = "touches" in event ? event.touches[0]?.clientX : event.clientX;
    dragStartXRef.current = clientX ?? null;
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null || currentImages.length <= 1) {
      return;
    }

    const clientX = "touches" in event ? event.touches[0]?.clientX : event.clientX;
    if (clientX === undefined) return;

    const delta = clientX - dragStartXRef.current;
    const threshold = 40;

    if (Math.abs(delta) < threshold) {
      return;
    }

    dragStartXRef.current = clientX;
    setActiveImageIndex((current) => {
      const nextIndex = delta > 0 ? current - 1 : current + 1;
      const total = currentImages.length;
      return (nextIndex + total) % total;
    });
  };

  const handlePointerUp = () => {
    dragStartXRef.current = null;
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseProduct) return;

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const payload = {
        name: reviewForm.name.trim(),
        email: reviewForm.email.trim() || undefined,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      };

      const data = await submitProductReview(baseProduct.id, payload);
      setReviews((current) => [data.review, ...current]);
      setSummary(data.summary);
      setReviewForm({ name: "", email: "", rating: 5, comment: "" });
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <Wrapper className="py-24">
        <div className="text-center text-white/70">
          Product not found.
          <div className="mt-4">
            <Button onClick={() => navigate("/")} className="bg-gold text-black rounded-none">
              Back to Home
            </Button>
          </div>
        </div>
      </Wrapper>
    );
  }

  const isSoldOut = !product.inStock || product.stockQuantity <= 0;

  return (
    <section
      className={`py-20 sm:py-24 bg-black min-h-screen transition-all duration-300 ${
        isReady && !isTransitioning ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <Wrapper>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to products
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => setViewMode("gallery")}
                className={`rounded-none px-4 py-2 text-xs ${
                  viewMode === "gallery"
                    ? "bg-gold text-black"
                    : "bg-white/5 text-white/70 border border-white/10 hover:border-gold/50"
                }`}
              >
                Gallery
              </Button>
              <Button
                type="button"
                onClick={() => setViewMode("spin")}
                disabled={spinImages.length === 0}
                className={`rounded-none px-4 py-2 text-xs ${
                  viewMode === "spin"
                    ? "bg-gold text-black"
                    : "bg-white/5 text-white/70 border border-white/10 hover:border-gold/50"
                }`}
              >
                360 View
              </Button>
            </div>
            <div
              className="aspect-square bg-white/5 border border-gold/20 overflow-hidden relative"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              <img
                src={currentImages[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {currentImages.length > 1 && (
                <div className="absolute bottom-3 left-3 bg-black/70 text-white/70 text-xs px-2 py-1">
                  {viewMode === "spin" ? "Drag to rotate" : "Swipe to view"}
                </div>
              )}
            </div>
            {currentImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {currentImages.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`border ${index === activeImageIndex ? "border-gold" : "border-white/10"} bg-white/5`}
                  >
                    <img src={src} alt={`${product.name} view ${index + 1}`} className="w-full h-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.2em]">Product</p>
              <h1 className="text-3xl sm:text-4xl text-white font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="text-white/70 text-sm">{summary.average.toFixed(1)}</span>
                <span className="text-white/50 text-xs">({summary.count} reviews)</span>
              </div>
            </div>

            <p className="text-white/70 text-sm sm:text-base">{product.description}</p>

            <div className="flex items-center gap-3">
              <span className="text-gold text-2xl sm:text-3xl font-bold">{formatPkr(product.price)}</span>
              {product.originalPrice && (
                <span className="text-white/40 text-lg line-through">{formatPkr(product.originalPrice)}</span>
              )}
            </div>

            <div className="text-sm text-white/70 space-y-1">
              <div>SKU: <span className="text-white">{product.sku}</span></div>
              <div>Stock: <span className={isSoldOut ? "text-red-400" : "text-white"}>{isSoldOut ? "Sold Out" : `${product.stockQuantity} available`}</span></div>
              <div>Minimum Order: <span className="text-white">{product.minOrderQuantity}</span></div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="bg-gold hover:bg-gold-light text-black rounded-none px-8 py-6 disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isSoldOut ? "Sold Out" : "Add to Cart"}
            </Button>
          </div>
        </div>

        <div className="mt-14 grid lg:grid-cols-[2fr_1fr] gap-8">
          <div className="bg-white/5 border border-white/10 p-5 sm:p-6">
            <h2 className="text-white text-xl font-semibold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
              Customer Reviews
            </h2>

            {reviewError && <p className="text-red-400 text-sm mb-4">{reviewError}</p>}
            {isLoadingReviews ? (
              <p className="text-white/60 text-sm">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-white/60 text-sm">No reviews yet. Be the first to review.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold">{review.name}</p>
                      <div className="flex items-center gap-1 text-gold text-sm">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-3 h-3 ${idx < review.rating ? "fill-gold" : "text-white/30"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/60 text-xs mt-1">{new Date(review.createdAt).toLocaleString()}</p>
                    <p className="text-white/70 text-sm mt-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 p-5 sm:p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Leave a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <Label className="text-white/70 text-sm">Name *</Label>
                <Input
                  name="name"
                  value={reviewForm.name}
                  onChange={handleReviewChange}
                  required
                  className="bg-white/5 border-white/20 text-white rounded-none text-sm"
                />
              </div>
              <div>
                <Label className="text-white/70 text-sm">Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={reviewForm.email}
                  onChange={handleReviewChange}
                  className="bg-white/5 border-white/20 text-white rounded-none text-sm"
                />
              </div>
              <div>
                <Label className="text-white/70 text-sm">Rating *</Label>
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-none text-sm px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value} className="text-black">
                      {value} Star{value > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-white/70 text-sm">Comment *</Label>
                <Textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  required
                  rows={4}
                  className="bg-white/5 border-white/20 text-white rounded-none text-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-gold text-black rounded-none py-4 disabled:opacity-60"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-white text-xl font-semibold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
            Related Products
          </h2>
          {relatedProducts.length === 0 ? (
            <p className="text-white/60 text-sm">No related products found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigateToSlug(item.slug)}
                  className="text-left border border-white/10 bg-white/5 hover:border-gold/50 transition-colors"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-gold text-sm mt-1">{formatPkr(item.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Wrapper>
    </section>
  );
};

export default ProductPage;

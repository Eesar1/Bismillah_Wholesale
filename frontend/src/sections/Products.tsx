import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, Star, ChevronRight, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/hooks/use-cart';
import Wrapper from '@/components/wrapper';
import { products } from '@/data/products';
import type { Product } from '@/types';
import { formatPkr } from '@/lib/currency';
import { fetchProductAvailability } from '@/lib/product-availability';

const Products: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'jewellery'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, { inStock: boolean; stockQuantity: number }>>({});
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  const mergedProducts = useMemo(() => {
    return products.map((product) => {
      const liveAvailability = availabilityMap[product.id];

      if (!liveAvailability) {
        return product;
      }

      return {
        ...product,
        inStock: liveAvailability.inStock,
        stockQuantity: liveAvailability.stockQuantity,
      };
    });
  }, [availabilityMap]);

  const displayedProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return mergedProducts;
    }

    return mergedProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory, mergedProducts]);

  // GSAP ScrollTrigger animation
  useEffect(() => {
    let isActive = true;
    let ctx: { revert: () => void } | undefined;

    const initAnimations = async () => {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (!isActive) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          '.products-header',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.products-header',
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );

        gsap.fromTo(
          '.category-filter',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.category-filter',
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }, sectionRef);
    };

    void initAnimations();

    return () => {
      isActive = false;
      ctx?.revert();
    };
  }, []);

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

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    addToCart(product, quantity);
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/product/${product.slug}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section id="products" ref={sectionRef} className="py-16 sm:py-24 bg-black">
      <Wrapper>
        {/* Section Header */}
        <div className="products-header text-center mb-10 sm:mb-16 opacity-0">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 block">
            Our Collection
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Featured <span className="text-gold">Products</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-2 sm:px-0">
            Browse our curated selection of premium jewellery available for wholesale with competitive pricing.
          </p>
        </div>

        {/* Category Filter */}
        <div className="category-filter flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 opacity-0">
          {[
            { id: 'all', label: 'All Products', icon: null },
            { id: 'jewellery', label: 'Jewellery', icon: Gem },
          ].map((category) => (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id as 'all' | 'jewellery')}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              className={`rounded-none px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base ${
                activeCategory === category.id
                  ? 'bg-gold text-black hover:bg-gold-light hover:text-black'
                  : 'border-gold/30 bg-transparent text-gold hover:bg-gold/15 hover:text-gold hover:border-gold'
              }`}
            >
              {category.icon && <category.icon className="w-4 h-4 mr-2" />}
              {category.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit="exit"
                className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-gold/50 transition-all duration-500 overflow-hidden"
              >
                {(() => {
                  const isSoldOut = !product.inStock || product.stockQuantity <= 0;
                  return (
                    <>
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-3">
                    <Button
                      size="icon"
                      onClick={() => setSelectedProduct(product)}
                      className="bg-white/10 hover:bg-gold text-white hover:text-black rounded-none w-10 h-10 sm:w-12 sm:h-12"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => handleAddToCart(product, 1)}
                      disabled={isSoldOut}
                      className="bg-gold hover:bg-gold-light text-black rounded-none w-10 h-10 sm:w-12 sm:h-12"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
                    {product.originalPrice && (
                      <Badge className="bg-red-500/80 text-white rounded-none text-xs">
                        Sale
                      </Badge>
                    )}
                    {isSoldOut && <Badge className="bg-white text-black rounded-none text-xs">Sold Out</Badge>}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5">
                  <div className="flex items-center gap-1 mb-1 sm:mb-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gold fill-gold" />
                    <span className="text-white/60 text-xs sm:text-sm">{product.rating}</span>
                    <span className="text-white/40 text-xs">({product.reviews})</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleViewProduct(product)}
                    className="text-left text-white font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 group-hover:text-gold transition-colors line-clamp-1"
                  >
                    {product.name}
                  </button>
                  
                  <p className="text-white/50 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-gold text-base sm:text-lg lg:text-xl font-bold">
                        {formatPkr(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-white/40 text-xs sm:text-sm line-through">
                          {formatPkr(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product, 1)}
                      disabled={isSoldOut}
                      className="bg-gold/10 hover:bg-gold text-gold hover:text-black rounded-none text-xs sm:text-sm px-2 sm:px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSoldOut ? 'Sold Out' : 'Add'}
                    </Button>
                  </div>
                </div>
                    </>
                  );
                })()}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {displayedProducts.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <p className="text-white/60 text-base sm:text-lg">No products found in this category.</p>
            <Button
              onClick={() => setActiveCategory('all')}
              className="mt-4 bg-gold hover:bg-gold-light text-black rounded-none"
            >
              View All Products
            </Button>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 sm:mt-12"
        >
          <Button
            variant="outline"
            onClick={() => setActiveCategory('all')}
            className="border-gold text-gold hover:bg-gold hover:text-black rounded-none px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base"
          >
            View All Products
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </motion.div>
      </Wrapper>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="bg-black border border-gold/30 max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle className="text-gold text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-2 sm:mt-4 p-4 sm:p-6 pt-0">
              {(() => {
                const isSelectedSoldOut = !selectedProduct.inStock || selectedProduct.stockQuantity <= 0;
                return (
                  <>
              <div className="aspect-square overflow-hidden">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold fill-gold" />
                  <span className="text-white text-sm sm:text-base">{selectedProduct.rating}</span>
                  <span className="text-white/50 text-xs sm:text-sm">({selectedProduct.reviews} reviews)</span>
                </div>
                
                <p className="text-white/70 text-sm sm:text-base">{selectedProduct.description}</p>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-gold text-2xl sm:text-3xl font-bold">
                    {formatPkr(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-white/40 text-lg sm:text-xl line-through">
                      {formatPkr(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 sm:space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">SKU:</span>
                    <span className="text-white">{selectedProduct.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Category:</span>
                    <span className="text-white capitalize">{selectedProduct.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Stock:</span>
                    <span className={isSelectedSoldOut ? 'text-red-400' : 'text-white'}>
                      {isSelectedSoldOut ? 'Sold Out' : `${selectedProduct.stockQuantity} available`}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  {selectedProduct.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-gold/30 text-gold/70 rounded-none text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button
                  onClick={() => {
                    handleAddToCart(selectedProduct, 1);
                    setSelectedProduct(null);
                  }}
                  disabled={isSelectedSoldOut}
                  className="w-full bg-gold hover:bg-gold-light text-black rounded-none py-4 sm:py-6 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {isSelectedSoldOut ? 'Sold Out' : 'Add to Cart'}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    handleViewProduct(selectedProduct);
                  }}
                  className="text-gold text-sm underline underline-offset-4 hover:text-gold-light transition-colors"
                >
                  View full details
                </button>
              </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Products;

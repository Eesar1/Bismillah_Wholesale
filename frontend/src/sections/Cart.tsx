import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { formatPkr } from '@/lib/currency';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, onCheckout }) => {
  const { state, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const totalPrice = getTotalPrice();
  const shippingCost = 0; // FREE shipping
  const finalTotal = totalPrice + shippingCost;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-black border-l border-gold/30 w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="border-b border-gold/20 p-4 sm:p-6">
          <SheetTitle className="text-gold flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 text-gold/20 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl text-white font-semibold mb-2">Your cart is empty</h3>
              <p className="text-white/50 mb-4 sm:mb-6 text-sm">Add some products to get started</p>
              <Button
                onClick={onClose}
                className="bg-gold hover:bg-gold-light text-black rounded-none text-sm"
              >
                Continue Shopping
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="popLayout">
                {state.items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 border border-white/10 mb-2 sm:mb-3"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate text-sm sm:text-base">{item.product.name}</h4>
                      <p className="text-gold text-xs sm:text-sm">{formatPkr(item.product.price)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white/10 hover:bg-gold/20 text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white w-6 sm:w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white/10 hover:bg-gold/20 text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-white/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="text-gold font-semibold text-sm">{formatPkr(item.product.price * item.quantity)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Cart Footer */}
            <div className="border-t border-gold/20 p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Summary */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPkr(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span className="text-green-400 font-semibold">FREE</span>
                </div>
                <Separator className="bg-gold/20" />
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-gold font-bold">{formatPkr(finalTotal)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={onCheckout}
                  className="w-full bg-gold hover:bg-gold-light text-black rounded-none py-4 sm:py-6 font-semibold text-sm"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 border-gold/30 text-gold hover:bg-gold/10 rounded-none text-sm"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-none px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;

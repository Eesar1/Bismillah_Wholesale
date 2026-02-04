import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, User, Check, Package, Banknote, Wallet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/hooks/use-cart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { submitOfflineOrder } from '@/lib/orders';
import { formatPkr } from '@/lib/currency';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type PaymentMethod = 'card' | 'cod' | 'jazzcash' | 'easypaisa';

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, onComplete }) => {
  const { state, getTotalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
  });
  
  const totalPrice = getTotalPrice();
  const shippingCost = 0; // FREE shipping
  const finalTotal = totalPrice + shippingCost;

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return customerInfo.fullName && customerInfo.email && customerInfo.phone && customerInfo.address && customerInfo.zipCode;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    if (paymentMethod === 'card') {
      setSubmitError('Card payments are coming soon. Please use COD, JazzCash, or Easypaisa for now.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await submitOfflineOrder({
        items: state.items,
        customer: customerInfo,
        paymentMethod,
      });
    } catch (error) {
      console.error('Offline order error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unable to place order right now. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    clearCart();
    onComplete();
    setStep(1);
    setCustomerInfo({ fullName: '', email: '', phone: '', address: '', zipCode: '' });
    setPaymentMethod('cod');
  };

  const paymentOptions = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Coming soon', disabled: true },
    { id: 'cod', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when you receive' },
    { id: 'jazzcash', label: 'JazzCash', icon: Smartphone, description: 'Pay via JazzCash mobile account' },
    { id: 'easypaisa', label: 'Easypaisa', icon: Wallet, description: 'Pay via Easypaisa mobile account' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-gold/30 max-w-2xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-gold/20 sticky top-0 bg-black z-10">
          <DialogTitle className="text-gold text-xl sm:text-2xl flex items-center gap-2 sm:gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="text-white/50 hover:text-gold transition-colors">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            {[
              { num: 1, icon: User, label: 'Details' },
              { num: 2, icon: CreditCard, label: 'Payment' },
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className={`flex flex-col items-center ${step >= s.num ? 'text-gold' : 'text-white/30'}`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                    step >= s.num ? 'border-gold bg-gold/10' : 'border-white/30'
                  }`}>
                    <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1">{s.label}</span>
                </div>
                {index < 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 ${step > s.num ? 'bg-gold' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Order Summary - Always visible */}
          <div className="bg-white/5 p-3 sm:p-4 border border-gold/20 mb-4 sm:mb-6">
            <h4 className="text-gold font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Order Summary</h4>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm max-h-32 overflow-y-auto custom-scrollbar">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-white/70">
                  <span className="truncate pr-2">{item.product.name} x {item.quantity}</span>
                  <span className="flex-shrink-0">{formatPkr(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="bg-gold/20 my-2 sm:my-3" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>{formatPkr(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span className="text-green-400 font-semibold">FREE</span>
              </div>
            </div>
            <Separator className="bg-gold/20 my-2 sm:my-3" />
            <div className="flex justify-between text-base sm:text-lg">
              <span className="text-white font-semibold">Total</span>
              <span className="text-gold font-bold">{formatPkr(finalTotal)}</span>
            </div>
          </div>

          {/* Step 1: Customer Details */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="text-lg sm:text-xl text-white font-semibold mb-3 sm:mb-4">Contact Information</h3>
                
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Full Name *</Label>
                  <Input
                    name="fullName"
                    value={customerInfo.fullName}
                    onChange={handleCustomerInfoChange}
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Phone Number *</Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Email *</Label>
                  <Input
                    name="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Address *</Label>
                  <Input
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerInfoChange}
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="123 Main Street, City"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">ZIP Code *</Label>
                  <Input
                    name="zipCode"
                    value={customerInfo.zipCode}
                    onChange={handleCustomerInfoChange}
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="54000"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="text-lg sm:text-xl text-white font-semibold mb-3 sm:mb-4">Payment Method</h3>
                
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => {
                    if (value === 'card') {
                      setSubmitError('Card payments are coming soon. Please use COD, JazzCash, or Easypaisa for now.');
                      return;
                    }
                    setSubmitError(null);
                    setPaymentMethod(value as PaymentMethod);
                  }}
                  className="space-y-2 sm:space-y-3"
                >
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border transition-all ${
                        option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        paymentMethod === option.id
                          ? 'border-gold bg-gold/10'
                          : 'border-white/20 hover:border-gold/50'
                      }`}
                    >
                      <RadioGroupItem value={option.id} disabled={option.disabled} className="text-gold border-gold" />
                      <option.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${paymentMethod === option.id ? 'text-gold' : 'text-white/60'}`} />
                      <div className="flex-1">
                        <div className={`text-sm sm:text-base font-medium ${paymentMethod === option.id ? 'text-gold' : 'text-white'}`}>
                          {option.label}
                        </div>
                        <div className="text-white/50 text-xs sm:text-sm">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                <div className="p-3 sm:p-4 bg-gold/10 border border-gold/30">
                  <p className="text-white/80 text-xs sm:text-sm">
                    Card payments are coming soon. Use COD, JazzCash, or Easypaisa for now.
                  </p>
                </div>

                {/* Mobile Payment Instructions */}
                {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 sm:p-4 bg-gold/10 border border-gold/30"
                  >
                    <p className="text-white/80 text-xs sm:text-sm">
                      You will receive payment instructions via SMS after placing your order. 
                      Please complete the payment within 24 hours.
                    </p>
                  </motion.div>
                )}

                <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm mt-3 sm:mt-4">
                  <Package className="w-4 h-4" />
                  <span>Your order will be processed within 24-48 hours</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          {submitError && (
            <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{submitError}</p>
          )}

          <div className="flex justify-end gap-2 sm:gap-3 mt-6 sm:mt-8">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10 rounded-none text-sm"
            >
              Cancel
            </Button>
            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
                className="bg-gold hover:bg-gold-light text-black rounded-none disabled:opacity-50 text-sm"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="bg-gold hover:bg-gold-light text-black rounded-none disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={handleSuccessClose}>
        <DialogContent className="bg-black border border-gold/30 max-w-md">
          <div className="text-center py-6 sm:py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl text-white font-bold mb-2">Order Placed!</h3>
            <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base px-2">
              Thank you for your order. We will contact you at {customerInfo.email} and {customerInfo.phone}.
            </p>
            <Button
              onClick={handleSuccessClose}
              className="bg-gold hover:bg-gold-light text-black rounded-none text-sm"
            >
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default Checkout;

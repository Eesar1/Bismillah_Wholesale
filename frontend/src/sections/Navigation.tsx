import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, Crown } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Wrapper from '@/components/wrapper';

interface NavigationProps {
  onCartClick: () => void;
  onNavigate: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onCartClick, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', section: 'hero' },
    { label: 'Products', section: 'products' },
    { label: 'About', section: 'about' },
    { label: 'Contact', section: 'contact' },
  ];

  const handleNavClick = (section: string) => {
    onNavigate(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md border-b border-gold/20'
          : 'bg-transparent'
      }`}
    >
      <Wrapper>
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => handleNavClick('hero')}
            whileHover={{ scale: 1.02 }}
          >
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-gold flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-xl font-bold text-gold tracking-wider whitespace-nowrap" style={{ fontFamily: 'Playfair Display, serif' }}>
                BISMILLAH
              </span>
              <span className="text-[10px] sm:text-xs text-gold/60 tracking-widest whitespace-nowrap">WHOLESALE</span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.button
                key={link.section}
                onClick={() => handleNavClick(link.section)}
                className="text-sm text-white/80 hover:text-gold transition-colors tracking-wider uppercase"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {link.label}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Button */}
            <motion.button
              onClick={onCartClick}
              className="relative p-2 text-white hover:text-gold transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:text-gold p-1">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-l border-gold/20 w-[280px] sm:w-80 p-0">
                <SheetHeader className="p-6 pb-4 border-b border-gold/20">
                  <SheetTitle className="text-gold flex items-center gap-3 text-xl">
                    <Crown className="w-6 h-6" />
                    <div className="flex flex-col">
                      <span>BISMILLAH</span>
                      <span className="text-xs text-gold/60 tracking-widest">WHOLESALE</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col py-4">
                  {navLinks.map((link, index) => (
                    <button
                      key={link.section}
                      onClick={() => handleNavClick(link.section)}
                      className="text-left text-base text-white/80 hover:text-gold hover:bg-gold/5 transition-all py-4 px-6 border-b border-white/5"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gold/20">
                  <p className="text-white/40 text-sm text-center">
                    Copyright 2024 Bismillah Wholesale
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Wrapper>
    </motion.header>
  );
};

export default Navigation;

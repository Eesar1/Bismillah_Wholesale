import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Instagram, Facebook, Twitter, Linkedin, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import Wrapper from '@/components/wrapper';

interface FooterProps {
  onNavigate: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Home', section: 'hero' },
    { label: 'Products', section: 'products' },
    { label: 'About Us', section: 'about' },
    { label: 'Contact', section: 'contact' },
  ];

  const categories = [
    { label: 'Necklaces', category: 'jewellery' },
    { label: 'Earrings', category: 'jewellery' },
    { label: 'Bracelets', category: 'jewellery' },
    { label: 'Rings', category: 'jewellery' },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-neutral-950 border-t border-gold/20">
      {/* Main Footer */}
      <Wrapper className="py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              <div>
                <span
                  className="text-base sm:text-xl font-bold text-gold tracking-wider block"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  BISMILLAH
                </span>
                <span className="text-[10px] sm:text-xs text-gold/60 tracking-widest">WHOLESALE</span>
              </div>
            </div>
            <p className="text-white/60 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm">
              Your premier destination for luxury jewellery and designer clothing wholesale. 
              Quality, elegance, and exceptional service since 2014.
            </p>
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/50 transition-all duration-300"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-6 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.section}>
                  <button
                    onClick={() => onNavigate(link.section)}
                    className="text-white/60 hover:text-gold transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-6 text-sm sm:text-base">Categories</h4>
            <ul className="space-y-2 sm:space-y-3">
              {categories.map((cat) => (
                <li key={cat.label}>
                  <button
                    onClick={() => onNavigate('products')}
                    className="text-white/60 hover:text-gold transition-colors text-xs sm:text-sm"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-6 text-sm sm:text-base">Contact Us</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-xs sm:text-sm">
                  123 Business Avenue<br />
                  Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0" />
                <span className="text-white/60 text-xs sm:text-sm">+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0" />
                <span className="text-white/60 text-xs sm:text-sm">info@bismillahwholesale.com</span>
              </li>
            </ul>
          </div>
        </div>
      </Wrapper>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <Wrapper className="py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-white/40 text-xs sm:text-sm text-center sm:text-left">
              Copyright{' '}
              <span suppressHydrationWarning>{currentYear}</span> Bismillah Wholesale. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => navigate("/privacy-policy")}
                className="text-white/40 hover:text-gold text-xs sm:text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/terms-of-service")}
                className="text-white/40 hover:text-gold text-xs sm:text-sm transition-colors"
              >
                Terms of Service
              </button>
              <motion.button
                onClick={scrollToTop}
                whileHover={{ y: -3 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all duration-300"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        </Wrapper>
      </div>
    </footer>
  );
};

export default Footer;

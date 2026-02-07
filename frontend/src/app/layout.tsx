import { Suspense, lazy, useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/layout/navbar";
import ScrollToTop from "@/layout/scroll-to-top";
import DefaultProviders from "@/providers/default-providers";
import "@/App.css";

const Footer = lazy(() => import("@/layout/footer"));
const Cart = lazy(() => import("@/sections/Cart"));
const Checkout = lazy(() => import("@/sections/Checkout"));

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = useCallback((section: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: section } });
      return;
    }

    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const scrollTarget = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTarget) {
      return;
    }

    const timer = window.setTimeout(() => {
      const element = document.getElementById(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      navigate("/", { replace: true, state: {} });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.state, navigate]);

  const handleCheckoutComplete = useCallback(() => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  }, []);

  return (
    <DefaultProviders>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <Navbar onCartClick={() => setIsCartOpen(true)} onNavigate={scrollToSection} />

        <main>{children}</main>

        <Suspense fallback={null}>
          <Footer onNavigate={scrollToSection} />
        </Suspense>

        <Suspense fallback={null}>
          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
        </Suspense>

        <Suspense fallback={null}>
          <Checkout
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onComplete={handleCheckoutComplete}
          />
        </Suspense>

        <ScrollToTop />
      </div>
    </DefaultProviders>
  );
};

export default RootLayout;
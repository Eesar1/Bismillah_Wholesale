import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";

interface DefaultProvidersProps {
  children: ReactNode;
}

const DefaultProviders = ({ children }: DefaultProvidersProps) => {
  return <CartProvider>{children}</CartProvider>;
};

export default DefaultProviders;
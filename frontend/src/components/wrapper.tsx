import React from "react";
import { cn } from "@/lib/utils";

interface WrapperProps {
  children: React.ReactNode;
  className?: string;
}

const Wrapper = ({ children, className }: WrapperProps) => {
  return (
    <div className={cn("w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20", className)}>
      {children}
    </div>
  );
};

export default Wrapper;
import { Suspense, lazy } from "react";
import Hero from "@/sections/Hero";

const Products = lazy(() => import("@/sections/Products"));
const About = lazy(() => import("@/sections/About"));
const Contact = lazy(() => import("@/sections/Contact"));

const Main = () => {
  return (
    <>
      <Hero onExploreProducts={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} />
      <Suspense fallback={null}>
        <Products />
        <About />
        <Contact />
      </Suspense>
    </>
  );
};

export default Main;
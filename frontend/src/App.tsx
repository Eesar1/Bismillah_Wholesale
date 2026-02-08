import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import RootLayout from "@/app/layout";
import HomePage from "@/app/page";

const AdminOrdersPage = lazy(() => import("@/views/admin/orders-page"));
const ProductPage = lazy(() => import("@/views/product/product-page"));
const PrivacyPolicy = lazy(() => import("@/views/legal/privacy-policy"));
const TermsOfService = lazy(() => import("@/views/legal/terms-of-service"));

const RootLayoutRoute = () => (
  <RootLayout>
    <Outlet />
  </RootLayout>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin" element={<AdminOrdersPage />} />
          <Route element={<RootLayoutRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

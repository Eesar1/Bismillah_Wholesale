import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import RootLayout from "@/app/layout";
import HomePage from "@/app/page";
import AdminOrdersPage from "@/views/admin/orders-page";
import ProductPage from "@/views/product/product-page";

const RootLayoutRoute = () => (
  <RootLayout>
    <Outlet />
  </RootLayout>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminOrdersPage />} />
        <Route element={<RootLayoutRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

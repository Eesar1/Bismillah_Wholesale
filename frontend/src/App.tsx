import RootLayout from "@/app/layout";
import HomePage from "@/app/page";
import AdminOrdersPage from "@/views/admin/orders-page";

function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <AdminOrdersPage />;
  }

  return (
    <RootLayout>
      <HomePage />
    </RootLayout>
  );
}

export default App;

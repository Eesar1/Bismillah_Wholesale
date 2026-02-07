import { useEffect, useMemo, useState } from "react";
import {
  listOrders,
  updateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from "@/lib/admin-orders";
import { formatPkr } from "@/lib/currency";
import { clearAdminToken, getAdminToken, loginAdmin, setAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusOptions: OrderStatus[] = [
  "pending",
  "awaiting_payment",
  "paid",
  "processing",
  "shipping",
  "shipped",
  "completed",
  "cancelled",
];

const formatStatus = (status: OrderStatus) => status.replace("_", " ");

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => getAdminToken());
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listOrders();
      setOrders(data.orders);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load orders.";
      if (message.toLowerCase().includes("unauthorized")) {
        handleLogout();
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      void loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [authToken]);

  const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      const result = await loginAdmin(loginForm.username.trim(), loginForm.password);
      setAdminToken(result.token);
      setAuthToken(result.token);
      setLoginForm({ username: "", password: "" });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setAuthToken(null);
    setOrders([]);
    setStatusFilter("all");
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const data = await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((item) => (item.id === orderId ? data.order : item)));
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Failed to update order.";
      if (message.toLowerCase().includes("unauthorized")) {
        handleLogout();
      }
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!authToken) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-16 sm:px-8">
        <div className="max-w-md mx-auto border border-gold/30 bg-white/5 p-6 space-y-4">
          <div>
            <p className="text-gold text-sm uppercase tracking-[0.2em]">Admin Access</p>
            <h1 className="text-2xl text-white font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
              Admin Login
            </h1>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm">Username</Label>
              <Input
                name="username"
                type="text"
                autoComplete="username"
                value={loginForm.username}
                onChange={handleLoginChange}
                required
                className="bg-white/5 border-white/20 text-white rounded-none text-sm"
              />
            </div>
            <div>
              <Label className="text-white/70 text-sm">Password</Label>
              <Input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="bg-white/5 border-white/20 text-white rounded-none text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gold text-black rounded-none py-4 disabled:opacity-60"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-gold text-sm uppercase tracking-[0.2em]">Admin</p>
            <h1 className="text-3xl sm:text-4xl text-gold" style={{ fontFamily: "Playfair Display, serif" }}>
              Orders Dashboard
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 border border-gold bg-transparent text-gold text-sm font-semibold"
            >
              Logout
            </Button>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "all")}
              className="bg-black border border-gold/40 px-3 py-2 text-sm text-white"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                void loadOrders();
              }}
              className="px-4 py-2 border border-gold bg-gold text-black text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
        </header>

        {error ? (
          <p className="text-red-400 text-sm border border-red-500/40 bg-red-500/10 px-4 py-3">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="text-white/70 text-sm">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-white/70 text-sm">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <article key={order.id} className="border border-gold/30 bg-white/5 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-gold font-semibold">{order.id}</p>
                    <p className="text-white/70 text-sm">
                      {new Date(order.createdAt).toLocaleString()} - {order.paymentMethod.toUpperCase()} -{" "}
                      {formatPkr(order.total)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        void handleStatusChange(order.id, event.target.value as OrderStatus)
                      }
                      disabled={updatingId === order.id}
                      className="bg-black border border-gold/40 px-3 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-sm text-white/80 grid gap-1">
                  <p>
                    <span className="text-white/60">Customer:</span> {order.customer.fullName}
                  </p>
                  <p>
                    <span className="text-white/60">Email:</span> {order.customer.email}
                  </p>
                  <p>
                    <span className="text-white/60">Phone:</span> {order.customer.phone}
                  </p>
                  <p>
                    <span className="text-white/60">Address:</span> {order.customer.address}, {order.customer.zipCode}
                  </p>
                </div>

                <div className="border-t border-gold/20 pt-3">
                  <p className="text-white/60 text-xs uppercase tracking-[0.12em] mb-2">Items</p>
                  <ul className="space-y-1 text-sm text-white/80">
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.product.id}`}>
                        {item.product.name} x {item.quantity} = {formatPkr(item.product.price * item.quantity)}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;

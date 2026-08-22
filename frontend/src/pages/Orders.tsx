import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

interface Order {
  id: string;
  trackingId: string;
  total: string;
  status: string;
  createdAt: string;
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(date),
  );
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/orders")
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-neutral px-4 py-6">
        <p className="text-text-primary">Cargando...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-bg-neutral px-4 py-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">Mis pedidos</h1>
        <p className="text-text-primary">
          Todavía no tienes pedidos.{" "}
          <Link to="/" className="text-accent-blue">
            Ir al catálogo
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">Mis pedidos</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/order/${order.id}`}
            className="block bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-text-primary font-medium font-mono">{order.trackingId}</p>
              <p className="text-text-primary text-sm">{formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-text-primary font-semibold">{formatPrice(order.total)}</p>
              <p className="text-text-primary text-sm capitalize">{order.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Orders;

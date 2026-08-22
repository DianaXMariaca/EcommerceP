import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import PanelNav from "../../components/PanelNav";

const STATUSES = ["pending", "paid", "shipped", "delivered"];

interface Order {
  id: string;
  trackingId: string | null;
  total: string;
  status: string;
  createdAt: string;
  user?: { email: string };
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

function Panel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadOrders() {
    setLoading(true);
    apiFetch("/orders")
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, status: string) {
    setError(null);
    setUpdatingId(orderId);

    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">Panel de administración</h1>
      <PanelNav />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-text-primary">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-text-primary">No hay pedidos todavía.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-primary border-b border-gray-200">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-text-primary">{order.user?.email ?? "—"}</td>
                  <td className="px-4 py-3 text-text-primary font-mono">
                    <Link to={`/order/${order.id}`} className="text-accent-blue">
                      {order.trackingId ?? order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-primary">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-text-primary">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-text-primary"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Panel;

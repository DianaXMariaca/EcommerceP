import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  product: { id: string; name: string; imageUrl: string };
}

interface Order {
  id: string;
  trackingId: string;
  total: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el pedido"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-neutral flex items-center justify-center px-4">
        <p className="text-text-primary">Cargando...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-neutral flex items-center justify-center px-4">
        <p className="text-text-primary">{error ?? "Pedido no encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <p className="text-cta-green text-xl font-semibold mb-1">¡Pedido confirmado! ✅</p>
        <p className="text-text-primary text-sm mb-4">
          Número de seguimiento:{" "}
          <span className="font-mono font-semibold text-lg text-text-primary">{order.trackingId}</span>
        </p>

        <div className="space-y-3 border-t border-gray-200 pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-text-primary font-medium">{item.product.name}</p>
                <p className="text-text-primary text-sm">Cantidad: {item.quantity}</p>
              </div>
              <p className="text-text-primary font-medium">
                {formatPrice(String(Number(item.unitPrice) * item.quantity))}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-text-primary">Total pagado</span>
          <span className="text-lg font-semibold text-text-primary">{formatPrice(order.total)}</span>
        </div>

        <Link
          to="/"
          className="mt-6 inline-block bg-cta-green text-white rounded px-4 py-2 font-medium"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import PanelNav from "../../components/PanelNav";

interface Summary {
  totalSales: string | number;
  orderCount: number;
  userCount: number;
}

function formatPrice(price: string | number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/summary")
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">Panel de administración</h1>
      <PanelNav />

      {loading || !summary ? (
        <p className="text-text-primary">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-text-primary mb-1">Ventas totales</p>
            <p className="text-3xl font-semibold text-text-primary">
              {formatPrice(summary.totalSales)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-text-primary mb-1">Pedidos</p>
            <p className="text-3xl font-semibold text-text-primary">{summary.orderCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-text-primary mb-1">Usuarios registrados</p>
            <p className="text-3xl font-semibold text-text-primary">{summary.userCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

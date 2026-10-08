import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface OrderDetail {
  orderId: string;
  date: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  subtotal: number;
  total: number;
}

export default function CheckoutSuccess() {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lastOrder = localStorage.getItem("lastOrder");
    if (!lastOrder) {
      navigate("/");
      return;
    }
    setOrder(JSON.parse(lastOrder));
  }, [navigate]);

  if (!order) return null;

  const formattedTotal = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(order.total);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
        
        {/* Encabezado de Éxito */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto font-bold text-2xl border border-green-100">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Gracias por tu compra, {order.user.name}!
          </h1>
          <p className="text-xs text-gray-500">
            Tu pedido ha sido procesado exitosamente. Hemos enviado la confirmación a{" "}
            <span className="font-semibold text-gray-800">{order.user.email}</span>.
          </p>
        </div>

        {/* Resumen del Pedido */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-500 pb-3 border-b border-gray-200">
            <div>
              <span className="block font-medium">Número de Pedido</span>
              <span className="font-bold text-gray-900">{order.orderId}</span>
            </div>
            <div className="text-right">
              <span className="block font-medium">Fecha</span>
              <span className="font-bold text-gray-900">{order.date}</span>
            </div>
          </div>

          {/* Lista de Productos Comprados */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Detalle de los Productos
            </h3>
            {order.items.map((item) => {
              const itemPriceFormatted = new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(item.price * item.quantity);

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs bg-white p-3 rounded-xl border border-gray-100"
                >
                  <div>
                    <span className="font-bold text-gray-900">{item.name}</span>
                    <span className="block text-gray-400 text-[10px]">
                      Cantidad: {item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-gray-900">
                    {itemPriceFormatted}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Envío Express</span>
              <span className="font-semibold text-green-600">Gratis</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
              <span>Total Pagado</span>
              <span className="text-base font-black text-blue-600">
                {formattedTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Información de Envío */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <span>🚚</span> Estado del Envío
          </div>
          <p className="text-gray-600">
            Tu paquete está en preparación y será despachado en las próximas 24 horas a tu dirección registrada.
          </p>
        </div>

        {/* Botón Volver */}
        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            Volver a la Tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
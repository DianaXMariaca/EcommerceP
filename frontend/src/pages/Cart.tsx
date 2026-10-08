import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  _id?: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
  quantity: number;
}

interface OrderSummary {
  orderId: string;
  date: string;
  user: {
    name: string;
    email: string;
  };
  items: CartItem[];
  total: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [completedOrder, setCompletedOrder] = useState<OrderSummary | null>(null);
  const navigate = useNavigate();

  // Cargar elementos del carrito desde localStorage
  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem("cart") || "[]");
      const formatted = items.map((item: any) => ({
        id: String(item.id || item._id || ""),
        name: item.name || item.title || "Producto sin nombre",
        price: Number(item.price) || 0,
        imageUrl:
          item.imageUrl ||
          item.image ||
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
        category: item.category || "GENERAL",
        quantity: Number(item.quantity) || 1,
      }));
      setCartItems(formatted);
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();

    window.addEventListener("cartUpdated", loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return;
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  // Calcular subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formattedSubtotal = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(subtotal);

  // PROCESO DE PAGO Y MOSTRAR RECIBO
  const handleCheckout = () => {
    const userSession = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // 1. Validar inicio de sesión
    if (!userSession && !token) {
      alert("Debes iniciar sesión para poder realizar la compra.");
      navigate("/login");
      return;
    }

    const userData = userSession
      ? JSON.parse(userSession)
      : { name: "Cliente", email: "cliente@tienda.com" };

    // 2. Generar el resumen de la orden
    const orderData: OrderSummary = {
      orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      user: userData,
      items: [...cartItems],
      total: subtotal,
    };

    // 3. Establecer la orden completada y vaciar el carrito
    setCompletedOrder(orderData);
    setCartItems([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  // -------------------------------------------------------------
  // VISTA 1: RECIBO DE CONFIRMACIÓN DE COMPRA
  // -------------------------------------------------------------
  if (completedOrder) {
    const formattedTotal = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(completedOrder.total);

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
          {/* Encabezado con Icono y Agradecimiento */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto font-bold text-2xl border border-green-100">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Gracias por tu compra, {completedOrder.user.name}!
            </h1>
            <p className="text-xs text-gray-500">
              Tu pedido ha sido procesado exitosamente. Hemos enviado la confirmación a{" "}
              <span className="font-semibold text-gray-800">
                {completedOrder.user.email}
              </span>.
            </p>
          </div>

          {/* Tarjeta con los detalles del pedido */}
          <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-500 pb-3 border-b border-gray-200">
              <div>
                <span className="block font-medium">Número de Pedido</span>
                <span className="font-bold text-gray-900">
                  {completedOrder.orderId}
                </span>
              </div>
              <div className="text-right">
                <span className="block font-medium">Fecha</span>
                <span className="font-bold text-gray-900">
                  {completedOrder.date}
                </span>
              </div>
            </div>

            {/* Listado de Productos Adquiridos */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Detalle de los Productos
              </h3>
              {completedOrder.items.map((item) => {
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

            {/* Total Pagado */}
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

          {/* Estado e información de envío */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-xs space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <span>🚚</span> Información y Estado del Envío
            </div>
            <p className="text-gray-600">
              Tu paquete está siendo preparado y será entregado en tu dirección
              registrada dentro de las próximas 24 a 48 horas.
            </p>
          </div>

          {/* Botón para regresar al catálogo */}
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

  // -------------------------------------------------------------
  // VISTA 2: CARRITO VACÍO
  // -------------------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
          🛒
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Aún no has agregado productos al carrito de compras.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VISTA 3: CARRITO CON PRODUCTOS
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          Vaciar Carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productos */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const itemTotal = new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(item.price * item.quantity);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-full object-contain"
                  />
                </div>

                <div className="flex-grow">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {item.name}
                  </h3>
                  <div className="text-sm font-black text-gray-900 mt-1">
                    {itemTotal}
                  </div>
                </div>

                {/* Modificar Cantidad */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-gray-500 hover:text-gray-900 font-bold px-1"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-gray-900 px-1">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-gray-500 hover:text-gray-900 font-bold px-1"
                  >
                    +
                  </button>
                </div>

                {/* Eliminar Producto */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                  title="Eliminar del carrito"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Resumen de Compra */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Resumen del Pedido
          </h2>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-gray-900">{formattedSubtotal}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Envío</span>
            <span className="font-semibold text-green-600">Gratis</span>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-black text-gray-900">
              {formattedSubtotal}
            </span>
          </div>

          {/* Botón Comprar */}
          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Proceder al Pago
          </button>

          <Link
            to="/"
            className="block text-center text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors pt-2"
          >
            ← Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
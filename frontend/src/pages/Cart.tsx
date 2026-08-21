import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, removeFromCart, updateCartQuantity } from "../lib/cart";
import type { CartLine } from "../lib/cart";

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function Cart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  function loadCart() {
    setLoading(true);
    getCart()
      .then(setLines)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleQuantityChange(line: CartLine, quantity: number) {
    await updateCartQuantity(line, quantity);
    loadCart();
  }

  async function handleRemove(line: CartLine) {
    await removeFromCart(line);
    loadCart();
  }

  const total = lines.reduce((sum, line) => sum + Number(line.product.price) * line.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-neutral px-4 py-6">
        <p className="text-text-primary">Cargando...</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-bg-neutral px-4 py-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">Carrito</h1>
        <p className="text-text-primary">
          Tu carrito está vacío.{" "}
          <Link to="/" className="text-accent-blue">
            Ir al catálogo
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">Carrito</h1>

      <div className="space-y-3">
        {lines.map((line) => (
          <div
            key={line.id}
            className="bg-white rounded-lg shadow p-3 flex items-center gap-4"
          >
            <img
              src={line.product.imageUrl}
              alt={line.product.name}
              className="w-20 h-20 object-cover rounded"
            />

            <div className="flex-1">
              <p className="text-text-primary font-medium">{line.product.name}</p>
              <p className="text-text-primary text-sm">{formatPrice(line.product.price)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(line, line.quantity - 1)}
                className="w-8 h-8 border border-gray-300 rounded text-text-primary"
              >
                −
              </button>
              <span className="w-6 text-center text-text-primary">{line.quantity}</span>
              <button
                onClick={() => handleQuantityChange(line, line.quantity + 1)}
                className="w-8 h-8 border border-gray-300 rounded text-text-primary"
              >
                +
              </button>
            </div>

            <p className="w-28 text-right text-text-primary font-medium">
              {formatPrice(String(Number(line.product.price) * line.quantity))}
            </p>

            <button
              onClick={() => handleRemove(line)}
              className="text-red-600 text-sm"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
        <span className="text-lg font-semibold text-text-primary">
          Total: {formatPrice(String(total))}
        </span>
        <button
          disabled
          className="bg-cta-green text-white rounded px-4 py-2 font-medium opacity-60 cursor-not-allowed"
        >
          Ir a pagar (Próximamente)
        </button>
      </div>
    </div>
  );
}

export default Cart;

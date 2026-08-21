import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { addToCart } from "../lib/cart";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  brand: string;
  category: string;
  specs: Record<string, string | number | boolean>;
  stock: number;
  imageUrl: string;
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/products/${id}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!product) return;
    setError(null);
    setAdded(false);

    try {
      await addToCart(product.id, quantity);
      setAdded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar al carrito");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-neutral flex items-center justify-center px-4">
        <p className="text-text-primary">Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-neutral flex items-center justify-center px-4">
        <p className="text-text-primary">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full aspect-square object-cover rounded"
        />

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-text-primary">{product.name}</h1>
          <p className="text-text-primary">{product.description}</p>
          <p className="text-accent-blue text-xl font-semibold">{formatPrice(product.price)}</p>
          <p className="text-sm text-text-primary">
            Marca: {product.brand} · Categoría: {product.category}
          </p>

          <div>
            <h2 className="text-sm font-medium text-text-primary mb-1">Especificaciones</h2>
            <ul className="text-sm text-text-primary list-disc list-inside">
              {Object.entries(product.specs).map(([key, value]) => (
                <li key={key}>
                  {key}: {String(value)}
                </li>
              ))}
            </ul>
          </div>

          {product.stock > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 border border-gray-300 rounded text-text-primary"
                >
                  −
                </button>
                <span className="w-6 text-center text-text-primary">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 border border-gray-300 rounded text-text-primary"
                >
                  +
                </button>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {added && <p className="text-cta-green text-sm">Agregado al carrito ✅</p>}

              <button
                onClick={handleAddToCart}
                className="bg-cta-green text-white rounded px-4 py-2 font-medium w-fit"
              >
                Añadir al carrito
              </button>
            </>
          ) : (
            <p className="text-red-600 font-medium">Sin stock disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

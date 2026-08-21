import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { addToCart } from "../lib/cart";

interface Product {
  id: string;
  name: string;
  price: string;
  brand: string;
  category: string;
  imageUrl: string;
  stock: number;
}

interface Filters {
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
}

const EMPTY_FILTERS: Filters = { category: "", brand: "", minPrice: "", maxPrice: "" };

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [cartMessages, setCartMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

    setLoading(true);
    apiFetch(`/products${params.toString() ? `?${params.toString()}` : ""}`)
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAddToCart(e: MouseEvent, product: Product) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart(product.id, 1);
      setCartMessages((prev) => ({ ...prev, [product.id]: "Agregado ✅" }));
    } catch (err) {
      setCartMessages((prev) => ({
        ...prev,
        [product.id]: err instanceof Error ? err.message : "Error al agregar",
      }));
    } finally {
      setTimeout(() => {
        setCartMessages((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">Catálogo</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Categoría"
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Marca"
          value={filters.brand}
          onChange={(e) => updateFilter("brand", e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Precio mínimo"
          value={filters.minPrice}
          onChange={(e) => updateFilter("minPrice", e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-36"
        />
        <input
          type="number"
          placeholder="Precio máximo"
          value={filters.maxPrice}
          onChange={(e) => updateFilter("maxPrice", e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-36"
        />
        <button
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="text-sm text-accent-blue"
        >
          Limpiar filtros
        </button>
      </div>

      {loading && <p className="text-text-primary">Cargando...</p>}

      {!loading && products.length === 0 && (
        <p className="text-text-primary">No se encontraron productos.</p>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-3 flex flex-col hover:shadow-md transition-shadow"
            >
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded mb-2"
                />
                <span className="text-text-primary font-medium block">{product.name}</span>
                <span className="text-accent-blue font-semibold block mb-2">
                  {formatPrice(product.price)}
                </span>
              </Link>

              {product.stock > 0 ? (
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="bg-cta-green text-white rounded px-3 py-2 text-sm font-medium"
                >
                  Añadir al carrito
                </button>
              ) : (
                <span className="text-red-600 text-sm">Sin stock</span>
              )}

              {cartMessages[product.id] && (
                <span className="text-xs text-text-primary mt-1">
                  {cartMessages[product.id]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;

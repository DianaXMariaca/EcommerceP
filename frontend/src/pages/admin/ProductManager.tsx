import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../../lib/api";
import PanelNav from "../../components/PanelNav";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  brand: string;
  category: string;
  specs: Record<string, unknown>;
  stock: number;
  imageUrl: string;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  brand: string;
  category: string;
  stock: string;
  imageUrl: string;
  specs: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  brand: "",
  category: "",
  stock: "",
  imageUrl: "",
  specs: "{}",
};

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function loadProducts() {
    setLoading(true);
    apiFetch("/products?take=200")
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      brand: product.brand,
      category: product.category,
      stock: String(product.stock),
      imageUrl: product.imageUrl,
      specs: JSON.stringify(product.specs ?? {}),
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let specs: Record<string, unknown>;
    try {
      specs = form.specs.trim() === "" ? {} : JSON.parse(form.specs);
    } catch {
      setError("Especificaciones inválidas: debe ser JSON válido");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      brand: form.brand,
      category: form.category,
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
      specs,
    };

    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      cancelEdit();
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;

    setError(null);
    try {
      await apiFetch(`/products/${product.id}`, { method: "DELETE" });
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el producto");
    }
  }

  return (
    <div className="min-h-screen bg-bg-neutral px-4 py-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">Panel de administración</h1>
      <PanelNav />

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          {editingId ? "Editar producto" : "Crear producto"}
        </h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Nombre"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Marca"
            required
            value={form.brand}
            onChange={(e) => updateField("brand", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Categoría"
            required
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Imagen (URL)"
            required
            value={form.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Precio"
            required
            min="0"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Stock"
            required
            min="0"
            value={form.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Especificaciones (JSON opcional)"
            value={form.specs}
            onChange={(e) => updateField("specs", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-2"
          />
          <textarea
            placeholder="Descripción"
            required
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-4"
            rows={2}
          />

          <div className="md:col-span-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-cta-green text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm text-accent-blue px-4 py-2"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="text-text-primary">Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-primary border-b border-gray-200">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-text-primary">{product.name}</td>
                  <td className="px-4 py-3 text-text-primary">{product.brand}</td>
                  <td className="px-4 py-3 text-text-primary">{product.category}</td>
                  <td className="px-4 py-3 text-text-primary">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-text-primary">{product.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-accent-blue text-sm mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
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

export default ProductManager;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  category: string;
  brand?: string;
  imageUrl?: string;
  description?: string;
}

const LOCAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Samsung Galaxy S24 Ultra 256GB",
    price: 4890000,
    category: "CELULARES",
    brand: "Samsung",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
    description: "Pantalla Dynamic AMOLED 2X de 6.8 pulgadas, cámara de 200 MP y procesador Snapdragon 8 Gen 3."
  },
  {
    id: "2",
    name: "iPhone 15 Pro Max 256GB",
    price: 5490000,
    category: "CELULARES",
    brand: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
    description: "Diseño de titanio de calidad aeroespacial, chip A17 Pro y sistema de cámaras profesional avanzado."
  },
  {
    id: "3",
    name: "Xiaomi Redmi Note 13 Pro+",
    price: 1850000,
    category: "CELULARES",
    brand: "Xiaomi",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500",
    description: "Cámara principal de 200 MP con OIS, carga hiperrápida de 120W y pantalla AMOLED curvada 120Hz."
  },
  {
    id: "4",
    name: "AirPods Pro (2.ª generación)",
    price: 980000,
    category: "AUDÍFONOS",
    brand: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500",
    description: "Cancelación Activa de Ruido de nivel superior, Transparencia adaptativa y Audio Espacial personalizado."
  },
  {
    id: "5",
    name: "Sony WH-1000XM5 Cancelación de Ruido",
    price: 1450000,
    category: "AUDÍFONOS",
    brand: "Sony",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    description: "Cancelación de ruido líder en la industria con dos procesadores y 8 micrófonos."
  },
  {
    id: "6",
    name: "Diadema Gamer Logitech G435 Wireless",
    price: 320000,
    category: "AUDÍFONOS",
    brand: "Logitech",
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
    description: "Audífonos inalámbricos ultra ligeros LIGHTSPEED y Bluetooth para gaming y música."
  },
  {
    id: "7",
    name: "Monitor Samsung Odyssey G5 32\"",
    price: 1650000,
    category: "MONITORES",
    brand: "Samsung",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
    description: "Curvatura 1000R, resolución WQHD y frecuencia de actualización de 165Hz con tiempo de respuesta de 1ms."
  },
  {
    id: "8",
    name: "Monitor Asus ProArt 24\" IPS",
    price: 1400000,
    category: "MONITORES",
    brand: "Asus",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
    description: "Monitor profesional con precisión de color Calman Verified y espacio de color 100% sRGB."
  },
  {
    id: "9",
    name: "SSD NVMe Kingston 1 TB PCIe 4.0",
    price: 420000,
    category: "COMPONENTES",
    brand: "Kingston",
    imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500",
    description: "Velocidades de lectura de hasta 3500 MB/s para mejorar el rendimiento de arranque y carga de programas."
  },
  {
    id: "10",
    name: "Laptop Asus ROG Zephyrus G16",
    price: 5200000,
    category: "LAPTOPS",
    brand: "Asus",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    description: "Portátil gaming ultradelgado con procesador de última generación y gráfica dedicada de alto rendimiento."
  }
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.product || data;
          if (p && p.name) {
            setProduct({
              id: p.id || p._id || id || "",
              name: p.name || p.title,
              price: Number(p.price) || 0,
              category: p.category || "GENERAL",
              brand: p.brand || "",
              imageUrl: p.imageUrl || p.image || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
              description: p.description || "Sin descripción disponible."
            });
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback a producto local
      }

      // Buscar en los productos locales por id
      const found = LOCAL_PRODUCTS.find((p) => p.id === id);
      setProduct(found || null);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = currentCart.findIndex(
      (item: any) => (item.id || item._id) === product.id
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity = (currentCart[existingIndex].quantity || 1) + 1;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    // Disparar evento personalizado para actualizar la barra superior en la misma pestaña
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-gray-500">
        Cargando detalles del producto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
        <p className="text-xs text-gray-500 mb-6">
          El producto que buscas no existe o no se encuentra disponible en este momento.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors"
        >
          ← Volver al Catálogo
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
      >
        ← Volver
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="w-full h-80 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full object-contain"
          />
        </div>

        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg">
                {product.category}
              </span>
              {product.brand && (
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="text-2xl font-black text-gray-900 mb-4">{formattedPrice}</div>
            <button
              onClick={handleAddToCart}
              className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {added ? "¡Añadido al Carrito!" : "Agregar al Carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
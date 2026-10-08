import React, { useState, useEffect } from "react";

interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
  brand?: string;
  stock?: number;
  description?: string;
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [selectedBrand, setSelectedBrand] = useState("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/products");
      if (res.ok) {
        const data = await res.json();
        const formattedProducts = data.map((item: any) => ({
          id: String(item._id || item.id || ""),
          name: item.name || item.nombre || item.title || "Producto sin nombre",
          price: Number(item.price || item.precio || 0),
          imageUrl:
            item.imageUrl ||
            item.image ||
            item.imagen ||
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
          category: (item.category || item.categoria || "GENERAL").toUpperCase(),
          brand: item.brand || item.marca || "GENÉRICO",
          description:
            item.description || item.descripcion || "Sin descripción disponible.",
        }));
        setProducts(formattedProducts);
      } else {
        useFallbackProducts();
      }
    } catch (err) {
      useFallbackProducts();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackProducts = () => {
    setProducts([
      {
        id: "1",
        name: "Samsung Galaxy S24 Ultra 256 GB",
        price: 4890000,
        imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
        category: "CELULARES",
        brand: "Samsung",
        description: "Smartphone de última generación con cámara de 200 MP, pantalla Dynamic AMOLED 2X y procesador Snapdragon 8 Gen 3.",
      },
      {
        id: "2",
        name: "iPhone 15 Pro Max de 256 GB",
        price: 5490000,
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        category: "CELULARES",
        brand: "Manzana",
        description: "Diseño en titanio de grado aeroespacial, chip A17 Pro, botón de Acción personalizable y sistema de cámaras Pro avanzadas.",
      },
      {
        id: "3",
        name: "Xiaomi Redmi Note 13 Pro+",
        price: 1850000,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
        category: "CELULARES",
        brand: "Xiaomi",
        description: "Pantalla AMOLED curva a 120 Hz, cámara triple de 200 MP con OIS y carga ultrarrápida HyperCharge de 120W.",
      },
      {
        id: "4",
        name: "AirPods Pro (2.ª generación)",
        price: 980000,
        imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500",
        category: "AUDÍFONOS",
        brand: "Manzana",
        description: "Cancelación Activa de Ruido el doble de potente, modo de Transparencia adaptativa y audio espacial personalizado.",
      },
      {
        id: "5",
        name: "Monitor Odyssey G5 de 32 pulgadas",
        price: 1450000,
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
        category: "MONITORES",
        brand: "Samsung",
        description: "Pantalla curva WQHD con resolución 2560x1440, tasa de refresco de 165 Hz y tiempo de respuesta de 1 ms.",
      },
      {
        id: "6",
        name: "Monitor ProArt de 24 pulgadas",
        price: 1120000,
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
        category: "MONITORES",
        brand: "Asus",
        description: "Monitor profesional diseñado para diseñadores y creadores de contenido, fidelidad de color 100% sRGB e impresión de fábrica Calman Verified.",
      },
      {
        id: "7",
        name: "SSD NVMe de 1 TB",
        price: 420000,
        imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500",
        category: "COMPONENTES",
        brand: "Samsung",
        description: "Unidad de estado sólido de alto rendimiento PCIe 4.0 NVMe M.2 con velocidades de lectura de hasta 7,000 MB/s.",
      },
      {
        id: "8",
        name: "AirPods Pro 2",
        price: 980000,
        imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500",
        category: "AUDIO",
        brand: "Manzana",
        description: "Audífonos premium con estuche MagSafe con altavoz integrado y enganche para correa.",
      },
      {
        id: "9",
        name: "Teclado Mecánico RGB Pro",
        price: 320000,
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        category: "PERIFÉRICOS",
        brand: "Razer",
        description: "Teclado mecánico gamer con switches ópticos de alta precisión, iluminación Chroma RGB y reposamuñecas ergonómico.",
      },
      {
        id: "10",
        name: "Mouse Gamer Inalámbrico",
        price: 250000,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        category: "PERIFÉRICOS",
        brand: "Logitech",
        description: "Mouse inalámbrico liviano de alto rendimiento con sensor HERO de 25,000 DPI y respuesta de 1 ms.",
      },
      {
        id: "11",
        name: "Portátil Asus ROG Strix G16",
        price: 6450000,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
        category: "PORTÁTILES",
        brand: "Asus",
        description: "Laptop gamer con procesador Intel Core i7, tarjeta gráfica RTX 4060, 16GB RAM y pantalla de 165Hz.",
      },
      {
        id: "12",
        name: "MacBook Air M2 13.6 pulgadas",
        price: 5290000,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        category: "PORTÁTILES",
        brand: "Manzana",
        description: "Diseño ultradelgado en aluminio, chip M2 con CPU de 8 núcleos, pantalla Liquid Retina y hasta 18 horas de batería.",
      },
      {
        id: "13",
        name: "Tablet Samsung Galaxy Tab S9 FE",
        price: 2150000,
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
        category: "TABLETAS",
        brand: "Samsung",
        description: "Pantalla de 10.9 pulgadas, incluye S Pen, resistencia al agua y polvo IP68 y batería de larga duración.",
      },
      {
        id: "14",
        name: "iPad Air de 10.9 pulgadas (5.ª Gen)",
        price: 3100000,
        imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500",
        category: "TABLETAS",
        brand: "Manzana",
        description: "Impulsado por el chip M1 de Apple, cámara frontal ultra gran angular de 12 MP con Encuadre Centrado y compatibilidad con Apple Pencil.",
      },
      {
        id: "15",
        name: "Audífonos Sony WH-1000XM5",
        price: 1690000,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "AUDIO",
        brand: "Sony",
        description: "Cancelación de ruido líder en la industria con dos procesadores y 8 micrófonos, llamadas ultra claras y 30 horas de autonomía.",
      },
      {
        id: "16",
        name: "Parlante Bluetooth JBL Charge 5",
        price: 720000,
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        category: "AUDIO",
        brand: "JBL",
        description: "Sonido Pro potente con driver de gran excursión, tweeter independiente, resistencia al agua y polvo IP67 y función de powerbank.",
      },
      {
        id: "17",
        name: "Smartwatch Moto Watch 100",
        price: 450000,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "DISPOSITIVOS PORTÁTILES",
        brand: "Motorola",
        description: "Caja de aluminio elegante, seguimiento dinámico de salud con 26 modos deportivos, GPS integrado y batería de hasta 14 días.",
      },
      {
        id: "18",
        name: "Memoria RAM Corsair Vengeance 32GB DDR5",
        price: 580000,
        imageUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500",
        category: "COMPONENTES",
        brand: "Corsario",
        description: "Optimizada para placas base Intel y AMD, altas frecuencias de procesamiento y disipador de calor de aluminio sólido.",
      },
      {
        id: "19",
        name: "Portátil HP Pavilion 15.6 FHD",
        price: 2890000,
        imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
        category: "PORTÁTILES",
        brand: "HP",
        description: "Procesador AMD Ryzen 7, 16GB RAM DDR4, SSD de 512GB y audio B&O con diseño compacto e ideal para productividad.",
      },
      {
        id: "20",
        name: "Silla Gamer Razer Iskur X",
        price: 1890000,
        imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500",
        category: "PERIFÉRICOS",
        brand: "Razer",
        description: "Diseño ergonómico para juegos maratónicos, cuero sintético multicapa resistente, cojines de espuma de alta densidad.",
      }
    ]);
  };

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item: any) => item.id === (product.id || product._id));

    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    alert(`¡${product.name} agregado al carrito!`);
  };

  const resetFilters = () => {
    setSelectedCategory("TODOS");
    setSelectedBrand("TODOS");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === "TODOS" ||
      (prod.category && prod.category.toUpperCase() === selectedCategory.toUpperCase());
    const matchesBrand =
      selectedBrand === "TODOS" ||
      (prod.brand && prod.brand.toUpperCase() === selectedBrand.toUpperCase());
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.category && prod.category.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesBrand && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const categories = [
    "TODOS",
    "MONITORES",
    "COMPONENTES",
    "AUDIO",
    "CELULARES",
    "PORTÁTILES",
    "DISPOSITIVOS PORTÁTILES",
    "PERIFÉRICOS",
    "TABLETAS",
  ];

  const brands = [
    "TODOS",
    "Samsung",
    "Asus",
    "Manzana",
    "HP",
    "Corsario",
    "Sony",
    "Logitech",
    "Kingston",
    "LG",
    "Xiaomi",
    "JBL",
    "Motorola",
    "Razer",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* BANNER PRINCIPAL CON PROMOCIONES, ENVÍOS Y REDES */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-400/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border border-white/20">
              <span>🔥 Ofertas Especiales de Temporada</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Catálogo de Productos
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Explora las mejores marcas con tecnología 100% oficial. Aprovecha descuentos exclusivos y las mejores garantías.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-blue-50">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <span>🚚</span>
                <span>Envío gratis a todo el país</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <span>🛡️</span>
                <span>Garantía oficial incluida</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs">
            <span className="font-semibold text-blue-100">Síguenos en redes sociales</span>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px]"
              >
                <span>Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px]"
              >
                <span>Instagram</span>
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500/80 hover:bg-green-500 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px]"
              >
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y RESULTADOS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar celulares, audífonos, marcas..."
            className="w-full pl-4 pr-10 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          {(selectedCategory !== "TODOS" || selectedBrand !== "TODOS" || searchTerm !== "") && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Ver todos los productos
            </button>
          )}

          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl w-fit">
            {filteredProducts.length} resultados
          </span>
        </div>
      </div>

      {/* FILTROS DE CATEGORÍA */}
      <div className="mb-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
          CATEGORÍAS:
        </span>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FILTROS DE MARCA */}
      <div className="mb-8">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
          MARCAS:
        </span>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => {
                setSelectedBrand(b);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedBrand === b
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {loading ? (
        <div className="text-center py-16 text-xs text-gray-500">Cargando productos...</div>
      ) : currentProducts.length === 0 ? (
        <div className="text-center py-16 text-xs text-gray-500 space-y-3">
          <p>No se encontraron productos con el filtro seleccionado.</p>
          <button
            onClick={resetFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Mostrar todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => {
            const formattedPrice = new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(product.price);

            return (
              <div
                key={product.id || product._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-48 bg-gray-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-2">
                    <img
                      src={
                        product.imageUrl ||
                        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"
                      }
                      alt={product.name}
                      className="max-h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                    <span>{product.category || "GENERAL"}</span>
                    <span className="text-gray-400">{product.brand}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">
                    {product.name}
                  </h3>

                  <div className="text-lg font-black text-gray-900 mb-4">
                    {formattedPrice}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Agregar al Carrito
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl text-xs transition-colors border border-gray-100"
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="flex justify-center items-center gap-2 mt-12">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
              currentPage === page
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Siguiente
        </button>
      </div>

      {/* MODAL VENTANA EMERGENTE DE DETALLE DEL PRODUCTO */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-6">
            {/* Botón Cerrar */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              ✕
            </button>

            {/* Imagen del Producto */}
            <div className="w-full h-56 bg-gray-50 rounded-2xl flex items-center justify-center p-4">
              <img
                src={
                  selectedProduct.imageUrl ||
                  "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"
                }
                alt={selectedProduct.name}
                className="max-h-full object-contain"
              />
            </div>

            {/* Información y Precio */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-blue-600 uppercase tracking-wider">
                <span>{selectedProduct.category || "GENERAL"}</span>
                <span className="text-gray-400">{selectedProduct.brand}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                {selectedProduct.name}
              </h2>

              <p className="text-xs text-gray-600 leading-relaxed pt-1">
                {selectedProduct.description ||
                  "Producto de tecnología original con garantía directa del fabricante e inspección de calidad garantizada."}
              </p>

              <div className="text-2xl font-black text-gray-900 pt-2">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(selectedProduct.price)}
              </div>
            </div>

            {/* Beneficios */}
            <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-1.5">
                <span>🚚 Envío Gratis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🛡️ Garantía Oficial</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
              >
                Agregar al Carrito
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
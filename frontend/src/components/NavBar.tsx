
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface User {
  name?: string;
  nombre?: string;
  email?: string;
}

export default function Navbar() {
  const [cartCount, setCartCount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Función para obtener y calcular el carrito
  const calculateCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = cart.reduce(
        (sum: number, item: any) => sum + (Number(item.quantity) || 1),
        0
      );
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }
  };

  // Función para obtener la información del usuario autenticado
  const checkUserSession = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    calculateCount();
    checkUserSession();

    // Escuchar eventos de actualización
    window.addEventListener("cartUpdated", calculateCount);
    window.addEventListener("userUpdated", checkUserSession);
    window.addEventListener("storage", () => {
      calculateCount();
      checkUserSession();
    });
    window.addEventListener("focus", () => {
      calculateCount();
      checkUserSession();
    });

    return () => {
      window.removeEventListener("cartUpdated", calculateCount);
      window.removeEventListener("userUpdated", checkUserSession);
      window.removeEventListener("storage", () => {
        calculateCount();
        checkUserSession();
      });
      window.removeEventListener("focus", () => {
        calculateCount();
        checkUserSession();
      });
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new CustomEvent("userUpdated"));
    navigate("/");
  };

  // Determinar el nombre a mostrar (soporta propiedad 'name' o 'nombre')
  const userName = user?.name || user?.nombre || user?.email?.split("@")[0] || "Usuario";

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo de la tienda */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white font-black rounded-lg flex items-center justify-center text-sm">
            mi
          </div>
          <div>
            <span className="font-extrabold text-gray-900 text-base">MVP</span>
            <span className="text-xs text-gray-500 ml-1 font-medium">
              de comercio electrónico
            </span>
          </div>
        </Link>

        {/* Acciones superiores */}
        <div className="flex items-center gap-5">
          {/* Ícono de carrito con insignia flotante */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors flex items-center justify-center"
            aria-label="Ver carrito"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>

            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Menú según el estado de la sesión */}
          {user ? (
            <div className="flex items-center gap-4">
              {/* Saludo con el nombre del usuario */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                  {userName.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  Hola, <span className="font-bold text-gray-900">{userName}</span>
                </span>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors border border-gray-200"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
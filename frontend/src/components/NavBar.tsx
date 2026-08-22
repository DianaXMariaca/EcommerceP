import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../lib/auth";
import { getCartCount, onCartUpdated } from "../lib/cart";

function NavBar() {
  const [cartCount, setCartCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const navigate = useNavigate();

  useEffect(() => {
    function refresh() {
      setLoggedIn(!!getToken());
      getCartCount().then(setCartCount);
    }

    refresh();
    return onCartUpdated(refresh);
  }, []);

  function handleLogout() {
    clearToken();
    setLoggedIn(false);
    navigate("/");
  }

  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between">
      <Link to="/" className="text-text-primary font-semibold text-lg">
        Ecommerce MVP
      </Link>

      <div className="flex items-center gap-4">
        {loggedIn ? (
          <>
            <Link to="/orders" className="text-sm text-accent-blue">
              Mis pedidos
            </Link>
            <button onClick={handleLogout} className="text-sm text-accent-blue">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-accent-blue">
              Iniciar sesión
            </Link>
            <Link to="/register" className="text-sm text-accent-blue">
              Registrarse
            </Link>
          </>
        )}

        <Link to="/cart" className="relative text-text-primary">
          <span aria-hidden="true">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-cta-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;

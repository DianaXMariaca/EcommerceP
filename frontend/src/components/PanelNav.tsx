import { Link, useLocation } from "react-router-dom";
import { getCurrentUserRole } from "../lib/auth";

function tabClass(active: boolean) {
  return active
    ? "px-3 py-2 text-sm font-medium border-b-2 border-cta-green text-text-primary"
    : "px-3 py-2 text-sm font-medium border-b-2 border-transparent text-accent-blue";
}

function PanelNav() {
  const { pathname } = useLocation();
  const role = getCurrentUserRole();

  return (
    <div className="flex gap-2 border-b border-gray-200 mb-6">
      <Link to="/panel" className={tabClass(pathname === "/panel")}>
        Órdenes
      </Link>
      {role === "admin" && (
        <>
          <Link to="/panel/products" className={tabClass(pathname === "/panel/products")}>
            Productos
          </Link>
          <Link to="/panel/dashboard" className={tabClass(pathname === "/panel/dashboard")}>
            Dashboard
          </Link>
        </>
      )}
    </div>
  );
}

export default PanelNav;

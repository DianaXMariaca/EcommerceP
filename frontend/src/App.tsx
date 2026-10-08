import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import NavBar from "./components/NavBar";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import Panel from "./pages/admin/Panel";
import ProductManager from "./pages/admin/ProductManager";
import Dashboard from "./pages/admin/Dashboard";

// Componente Footer integrado directamente
function Footer() {
  return (
 <footer className="bg-white border-t border-gray-100 py-6 mt-12">
  <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3 text-xs text-gray-500 text-center">
    {/* Identidad de marca centrada */}
    <div className="flex items-center justify-center gap-2">
      <div className="w-6 h-6 bg-blue-600 text-white font-black rounded flex items-center justify-center text-xs">
        mi
      </div>
      <span className="font-bold text-gray-900">MVP</span>
      <span className="text-gray-400">de comercio electrónico</span>
    </div>

    {/* Derechos reservados centrados */}
    <div>
      © {new Date().getFullYear()} TIENDA OFICIAL. Todos los derechos reservados.
    </div>
  </div>
</footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-gray-50/50">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order/:id" element={<OrderConfirmation />} />
            <Route path="/orders" element={<Orders />} />
            <Route
              path="/panel"
              element={
                <ProtectedRoute allowedRoles={["support", "admin"]}>
                  <Panel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/panel/products"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ProductManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/panel/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
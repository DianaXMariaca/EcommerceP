import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <NavBar />
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
    </BrowserRouter>
  );
}

export default App;

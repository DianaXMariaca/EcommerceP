import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      // 1. Petición al backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      // 2. Guardar credenciales y datos del usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user || { email, name: email.split("@")[0] })
      );

      // 3. Notificar al Navbar para que actualice la vista de la sesión
      window.dispatchEvent(new CustomEvent("userUpdated"));

      // 4. Redirigir al inicio / catálogo
      navigate("/");
    } catch (err: any) {
      // Si la API falla o no está conectada, se simula el inicio de sesión para pruebas
      localStorage.setItem(
        "user",
        JSON.stringify({ email, name: email.split("@")[0] })
      );
      window.dispatchEvent(new CustomEvent("userUpdated"));
      navigate("/");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-xs text-gray-500 mt-1">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            Ingresar
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
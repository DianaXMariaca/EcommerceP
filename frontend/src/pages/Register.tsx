import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { saveToken } from "../lib/auth";
import { getGuestCart, clearGuestCart } from "../lib/guestCart";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveToken(token);

      const guestCart = getGuestCart();
      if (guestCart.length > 0) {
        await apiFetch("/cart/merge", {
          method: "POST",
          body: JSON.stringify(guestCart),
        });
        clearGuestCart();
      }

      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-neutral px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-text-primary">Crear cuenta</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <label className="block text-sm text-text-primary mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-text-primary mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cta-green text-white rounded px-3 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>

        <p className="text-sm text-text-primary text-center">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-accent-blue">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;

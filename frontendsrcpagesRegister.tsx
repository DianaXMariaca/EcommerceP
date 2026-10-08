import { useState, useEffect } from 'react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 1. Limpiar campos al entrar/cargar la página
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // OBLIGATORIO para evitar la recarga de página

    try {
      // Petición al backend
      const response = await api.post('/auth/register', formData);

      if (response.ok) {
        // 2. Limpiar campos tras registrar con éxito
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        autoComplete="off"
      />
      
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        autoComplete="off"
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        autoComplete="new-password"
      />

      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        autoComplete="new-password"
      />

      <button type="submit">Registrarse</button>
    </form>
  );
};
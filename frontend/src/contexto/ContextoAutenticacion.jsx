import { createContext, useContext, useEffect, useState } from 'react';
import {
  obtenerUsuarioAutenticado,
  guardarToken,
  eliminarToken,
  cerrarSesion as apiCerrarSesion,
} from '../servicios/autenticacion';

const ContextoAutenticacion = createContext();

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarUsuario() {
      setCargando(true);
      const user = await obtenerUsuarioAutenticado();
      setUsuario(user);
      setCargando(false);
    }
    cargarUsuario();
  }, []);

  const login = (usuario, token) => {
    guardarToken(token);
    setUsuario(usuario);
  };

  const logout = async () => {
    await apiCerrarSesion();
    setUsuario(null);
  };

  return (
    <ContextoAutenticacion.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}

export function useAutenticacion() {
  return useContext(ContextoAutenticacion);
}

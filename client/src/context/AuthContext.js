import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Decodificar el token para obtener la info del usuario
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsuario({
          id: payload.id,
          username: payload.username,
          rol: payload.rol,
          medico_id: payload.medico_id,
          paciente_id: payload.paciente_id,
        });
      } catch (error) {
        console.error("Error al decodificar token:", error);
        logout();
      }
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });

      setToken(response.data.token);
      setUsuario(response.data.usuario);
      localStorage.setItem("token", response.data.token);

      return {
        success: true,
        usuario: response.data.usuario,
      };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error en login",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

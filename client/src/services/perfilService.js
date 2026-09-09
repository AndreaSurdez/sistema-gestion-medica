import api from './api';

export const obtenerPerfil = async () => {
  const response = await api.get('/perfil');
  return response.data;
};

export const actualizarPerfil = async (datos) => {
  const response = await api.put('/perfil', datos);
  return response.data;
};

export const cambiarPassword = async (datos) => {
  const response = await api.put('/perfil/password', datos);
  return response.data;
};

export const obtenerCitasPaciente = async () => {
  const response = await api.get('/perfil/citas');
  return response.data;
};

export const obtenerHistorialPaciente = async () => {
  const response = await api.get('/perfil/historial');
  return response.data;
};
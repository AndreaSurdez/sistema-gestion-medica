import api from './api';

export const consultarHistorial = async (paciente_id) => {
  const response = await api.get(`/historial/paciente/${paciente_id}`);
  return response.data;
};

export const registrarEntrada = async (datos) => {
  const response = await api.post('/historial', datos);
  return response.data;
};
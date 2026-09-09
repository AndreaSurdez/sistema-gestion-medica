import api from './api';

export const crearCita = async (datos) => {
  const response = await api.post('/citas', datos);
  return response.data;
};

export const listarAgenda = async (medico_id, fecha) => {
  const params = new URLSearchParams();
  if (medico_id) params.append('medico_id', medico_id);
  if (fecha) params.append('fecha', fecha);
  const response = await api.get(`/citas?${params.toString()}`);
  return response.data;
};

export const cancelarCita = async (id) => {
  const response = await api.put(`/citas/${id}/cancelar`);
  return response.data;
};
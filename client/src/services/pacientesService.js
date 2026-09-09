import api from './api';

export const registrarPaciente = async (datos) => {
  const response = await api.post('/pacientes', datos);
  return response.data;
};

export const listarPacientes = async () => {
  const response = await api.get('/pacientes');
  return response.data;
};

export const buscarPaciente = async (id) => {
  const response = await api.get(`/pacientes/${id}`);
  return response.data;
};

export const actualizarPaciente = async (id, datos) => {
  const response = await api.put(`/pacientes/${id}`, datos);
  return response.data;
};
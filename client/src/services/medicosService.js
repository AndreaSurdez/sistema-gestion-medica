import api from './api';

export const listarMedicos = async () => {
  const response = await api.get('/medicos');
  return response.data;
};

export const crearMedico = async (datos) => {
  const response = await api.post('/medicos', datos);
  return response.data;
};

export const eliminarMedico = async (id) => {
  const response = await api.delete(`/medicos/${id}`);
  return response.data;
};
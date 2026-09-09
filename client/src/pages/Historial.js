import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Divider
} from '@mui/material';
import Navbar from '../components/Navbar';
import { consultarHistorial, registrarEntrada } from '../services/historialService';
import { buscarPaciente } from '../services/pacientesService';

const Historial = () => {
  const { pacienteId } = useParams();
  const [historial, setHistorial] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [open, setOpen] = useState(false);
  const [nuevaEntrada, setNuevaEntrada] = useState({
    paciente_id: pacienteId, cita_id: '', motivo_consulta: '', diagnostico: '', tratamiento: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  const cargarDatos = async () => {
    try {
      const pac = await buscarPaciente(pacienteId);
      setPaciente(pac);
      
      const hist = await consultarHistorial(pacienteId);
      setHistorial(hist);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const handleRegistrar = async () => {
    setError('');
    setSuccess('');
    try {
      await registrarEntrada(nuevaEntrada);
      setSuccess('Entrada registrada exitosamente');
      setOpen(false);
      setNuevaEntrada({ paciente_id: pacienteId, cita_id: '', motivo_consulta: '', diagnostico: '', tratamiento: '' });
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar entrada');
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 14 }}>
        <Typography variant="h4" gutterBottom>Historial Clínico</Typography>
        
        {paciente && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6">
              Paciente: {paciente.nombre} {paciente.apellido_paterno}
            </Typography>
            <Typography variant="body2">CURP: {paciente.curp}</Typography>
            <Typography variant="body2">Fecha de nacimiento: {paciente.fecha_nacimiento}</Typography>
          </Paper>
        )}
        
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
          Nueva Entrada de Historial
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {historial.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No hay entradas de historial registradas</Typography>
          </Paper>
        ) : (
          historial.map((entrada, idx) => (
            <Paper key={idx} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" color="primary">
                {new Date(entrada.fecha_registro).toLocaleString('es-MX')}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Médico: {entrada.medico_nombre}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                <strong>Motivo de consulta:</strong>
              </Typography>
              <Typography variant="body2" paragraph>{entrada.motivo_consulta}</Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Diagnóstico:</strong>
              </Typography>
              <Typography variant="body2" paragraph>{entrada.diagnostico}</Typography>
              
              {entrada.tratamiento && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Tratamiento:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>{entrada.tratamiento}</Typography>
                </>
              )}
              
              {entrada.observaciones && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Observaciones:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>{entrada.observaciones}</Typography>
                </>
              )}
            </Paper>
          ))
        )}

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Registrar Entrada de Historial Clínico</DialogTitle>
          <DialogContent>
            <TextField 
              fullWidth 
              label="Motivo de Consulta" 
              multiline 
              rows={2}
              value={nuevaEntrada.motivo_consulta}
              onChange={(e) => setNuevaEntrada({...nuevaEntrada, motivo_consulta: e.target.value})}
              margin="normal" 
              required 
            />
            <TextField 
              fullWidth 
              label="Diagnóstico" 
              multiline 
              rows={2}
              value={nuevaEntrada.diagnostico}
              onChange={(e) => setNuevaEntrada({...nuevaEntrada, diagnostico: e.target.value})}
              margin="normal" 
              required 
            />
            <TextField 
              fullWidth 
              label="Tratamiento" 
              multiline 
              rows={2}
              value={nuevaEntrada.tratamiento}
              onChange={(e) => setNuevaEntrada({...nuevaEntrada, tratamiento: e.target.value})}
              margin="normal" 
            />
            <TextField 
              fullWidth 
              label="Observaciones" 
              multiline 
              rows={2}
              value={nuevaEntrada.observaciones}
              onChange={(e) => setNuevaEntrada({...nuevaEntrada, observaciones: e.target.value})}
              margin="normal" 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleRegistrar} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Historial;
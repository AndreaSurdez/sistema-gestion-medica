import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Grid, Chip, Tabs, Tab, Divider
} from '@mui/material';
import { EventNote, MedicalServices, CalendarToday } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { obtenerCitasPaciente, obtenerHistorialPaciente } from '../services/perfilService';

const PortalPaciente = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [tab, setTab] = useState(0);
  const [citas, setCitas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [citasData, historialData] = await Promise.all([
        obtenerCitasPaciente(),
        obtenerHistorialPaciente()
      ]);
      setCitas(citasData);
      setHistorial(historialData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: '#fef3c7',
      finalizada: '#d1fae5',
      en_atencion: '#dbeafe',
      cancelada: '#fee2e2'
    };
    const textColors = {
      pendiente: '#f59e0b',
      finalizada: '#10b981',
      en_atencion: '#3b82f6',
      cancelada: '#ef4444'
    };
    return { bg: colors[estado] || '#f1f5f9', color: textColors[estado] || '#64748b' };
  };

  return (
    <>
      <Navbar />
      <Container maxWidth={false} sx={{ pt: 12, pb: 8, px: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '2.5rem' }}>
            Mi Portal de Salud
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido/a, {usuario?.username}. Aquí puedes ver tus citas e historial médico.
          </Typography>
        </Box>

        <Tabs 
          value={tab} 
          onChange={(e, newValue) => setTab(newValue)}
          sx={{ mb: 4, borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab label="Mis Citas" icon={<CalendarToday />} iconPosition="start" />
          <Tab label="Mi Historial Clínico" icon={<MedicalServices />} iconPosition="start" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>
              Mis Citas Programadas
            </Typography>
            
            {citas.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <EventNote sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  No tienes citas programadas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contacta al centro de salud para agendar una cita
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {citas.map((cita) => {
                  const estadoColors = getEstadoColor(cita.estado);
                  return (
                    <Grid item xs={12} md={6} key={cita.id}>
                      <Paper sx={{ p: 4, borderRadius: 3, border: '2px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {new Date(cita.fecha).toLocaleDateString('es-MX')} - {cita.hora}
                          </Typography>
                          <Chip 
                            label={cita.estado.toUpperCase()}
                            sx={{ bgcolor: estadoColors.bg, color: estadoColors.color, fontWeight: 700 }}
                          />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Médico:</strong> Dr. {cita.medico_nombre} {cita.medico_apellido}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Especialidad:</strong> {cita.especialidad}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Tipo:</strong> {cita.tipo_cita || 'Consulta General'}
                        </Typography>
                        {cita.motivo_consulta && (
                          <Typography variant="body2">
                            <strong>Motivo:</strong> {cita.motivo_consulta}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>
              Mi Historial Clínico
            </Typography>
            
            {historial.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <MedicalServices sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  No hay registros en tu historial
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tu historial clínico aparecerá aquí después de tus consultas
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {historial.map((registro, index) => (
                  <Paper key={index} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {new Date(registro.fecha_consulta).toLocaleDateString('es-MX', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </Typography>
                      <Chip 
                        label={registro.especialidad}
                        sx={{ bgcolor: '#dbeafe', color: '#2563eb', fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Atendido por: Dr. {registro.medico_nombre} {registro.medico_apellido}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Motivo de consulta:
                      </Typography>
                      <Typography variant="body2">{registro.motivo_consulta}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Diagnóstico:
                      </Typography>
                      <Typography variant="body2">{registro.diagnostico}</Typography>
                      {registro.diagnostico_cie10 && (
                        <Chip 
                          label={`CIE-10: ${registro.diagnostico_cie10}`}
                          size="small"
                          sx={{ mt: 1, bgcolor: '#f1f5f9' }}
                        />
                      )}
                    </Box>
                    
                    {registro.tratamiento && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Tratamiento:
                        </Typography>
                        <Typography variant="body2">{registro.tratamiento}</Typography>
                      </Box>
                    )}
                    
                    {registro.medicamentos_recetados && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Medicamentos:
                        </Typography>
                        <Typography variant="body2">
                          {registro.medicamentos_recetados}
                          {registro.dosis && ` - ${registro.dosis}`}
                          {registro.frecuencia && ` - ${registro.frecuencia}`}
                        </Typography>
                      </Box>
                    )}
                    
                    {registro.recomendaciones && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Recomendaciones:
                        </Typography>
                        <Typography variant="body2" sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 2 }}>
                          {registro.recomendaciones}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </>
  );
};

export default PortalPaciente;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import Navbar from "../components/Navbar";
import {
  consultarHistorial,
  registrarEntrada,
} from "../services/historialService";
import { buscarPaciente } from "../services/pacientesService";

const Historial = () => {
  const { pacienteId } = useParams();
  const [historial, setHistorial] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [open, setOpen] = useState(false);
  const [nuevaEntrada, setNuevaEntrada] = useState({
    paciente_id: pacienteId,
    cita_id: "",
    motivo_consulta: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    fecha_control: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      console.error("Error al cargar historial:", error);
    }
  };

  const handleRegistrar = async () => {
    setError("");
    setSuccess("");
    try {
      await registrarEntrada(nuevaEntrada);
      setSuccess("Entrada registrada exitosamente");
      setOpen(false);
      setNuevaEntrada({
        paciente_id: pacienteId,
        cita_id: "",
        motivo_consulta: "",
        diagnostico: "",
        tratamiento: "",
        observaciones: "",
        fecha_control: "",
      });
      cargarDatos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar entrada");
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 14, mb: 8 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: "#0f172a" }}
        >
          Historial Clínico
        </Typography>

        {paciente && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {paciente.nombre} {paciente.apellido_paterno}{" "}
              {paciente.apellido_materno}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              CURP: {paciente.curp} | Nacimiento: {paciente.fecha_nacimiento}
            </Typography>
          </Paper>
        )}

        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ mb: 3, bgcolor: "#2563eb" }}
        >
          + Nueva Entrada de Historial
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {historial.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <Typography color="text.secondary">
              No hay entradas de historial registradas para este paciente.
            </Typography>
          </Paper>
        ) : (
          historial.map((entrada, idx) => (
            <Paper
              key={idx}
              sx={{ p: 4, mb: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  {new Date(entrada.fecha_registro).toLocaleDateString(
                    "es-MX",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ bgcolor: "#f1f5f9", px: 2, py: 0.5, borderRadius: 1 }}
                >
                  Dr. {entrada.medico_nombre}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Motivo de consulta:
                  </Typography>
                  <Typography variant="body1">
                    {entrada.motivo_consulta}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Diagnóstico:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#0f172a", fontWeight: 500 }}
                  >
                    {entrada.diagnostico}
                  </Typography>
                </Grid>
                {entrada.tratamiento && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Tratamiento:
                    </Typography>
                    <Typography variant="body1">
                      {entrada.tratamiento}
                    </Typography>
                  </Grid>
                )}
                {entrada.fecha_control && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        fontWeight: 700,
                        mt: 1,
                        bgcolor: "#eff6ff",
                        p: 1.5,
                        borderRadius: 1,
                        display: "inline-block",
                      }}
                    >
                      Próxima fecha de control:{" "}
                      {new Date(entrada.fecha_control).toLocaleDateString(
                        "es-MX",
                      )}
                    </Typography>
                  </Grid>
                )}
                {entrada.observaciones && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5, mt: 1 }}
                    >
                      Observaciones:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entrada.observaciones}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          ))
        )}

        {/* Dialog con diseño original y etiquetas arriba */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{ bgcolor: "#2563eb", color: "white", fontWeight: 700 }}
          >
            Registrar Entrada de Historial Clínico
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Motivo de Consulta *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={nuevaEntrada.motivo_consulta}
                  onChange={(e) =>
                    setNuevaEntrada({
                      ...nuevaEntrada,
                      motivo_consulta: e.target.value,
                    })
                  }
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Diagnóstico *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={nuevaEntrada.diagnostico}
                  onChange={(e) =>
                    setNuevaEntrada({
                      ...nuevaEntrada,
                      diagnostico: e.target.value,
                    })
                  }
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Tratamiento
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={nuevaEntrada.tratamiento}
                  onChange={(e) =>
                    setNuevaEntrada({
                      ...nuevaEntrada,
                      tratamiento: e.target.value,
                    })
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Fecha de Próximo Control
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={nuevaEntrada.fecha_control}
                  onChange={(e) =>
                    setNuevaEntrada({
                      ...nuevaEntrada,
                      fecha_control: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Observaciones
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={nuevaEntrada.observaciones}
                  onChange={(e) =>
                    setNuevaEntrada({
                      ...nuevaEntrada,
                      observaciones: e.target.value,
                    })
                  }
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleRegistrar}
              variant="contained"
              sx={{ bgcolor: "#2563eb" }}
            >
              Guardar Entrada
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Historial;

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Box,
  Chip,
  IconButton,
  Autocomplete,
} from "@mui/material";
import {
  Add,
  FilterList,
  Print,
  Edit,
  Delete,
  Clear,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Citas = () => {
  const { usuario } = useAuth();
  const [open, setOpen] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [nuevaCita, setNuevaCita] = useState({
    paciente_id: "",
    medico_id: "",
    fecha: "",
    hora: "",
    motivo_consulta: "",
    tipo_cita: "Consulta General",
  });
  const [citaEditar, setCitaEditar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filtroMedico, setFiltroMedico] = useState(null);
  const [filtroPaciente, setFiltroPaciente] = useState(null);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // TODOS los usuarios pueden ver pacientes
      const pacientesRes = await api.get("/pacientes");
      setPacientes(pacientesRes.data);

      let listaMedicos = [];

      if (usuario.rol === "administrativo") {
        const medicosRes = await api.get("/medicos");
        listaMedicos = medicosRes.data;
      } else if (usuario.rol === "medico") {
        // Obtener info del médico logueado
        const miInfo = await api.get("/perfil");
        listaMedicos = [
          {
            id: miInfo.data.medico_id,
            nombre: miInfo.data.medico_nombre || "Yo",
            apellido_paterno: miInfo.data.medico_apellido || "",
            especialidad: miInfo.data.especialidad || "General",
          },
        ];

        // AUTO-SELECCIONAR al médico logueado
        setNuevaCita((prev) => ({
          ...prev,
          medico_id: miInfo.data.medico_id.toString(),
          especialidad: miInfo.data.especialidad || "General",
        }));
      }

      setMedicos(listaMedicos);
      await cargarCitas();
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const cargarCitas = async () => {
    try {
      setError("");
      let medicoId = filtroMedico?.id || null;

      // Si es médico, forzar que solo vea SUS citas
      if (usuario.rol === "medico" && usuario.medico_id) {
        medicoId = usuario.medico_id;
      }

      const params = {};
      if (medicoId) params.medico_id = medicoId;
      if (filtroFechaInicio) params.fecha_inicio = filtroFechaInicio;
      if (filtroFechaFin) params.fecha_fin = filtroFechaFin;
      if (filtroPaciente?.id) params.paciente_id = filtroPaciente.id;

      const response = await api.get("/citas", { params });
      setCitas(response.data);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setError("Error al cargar las citas");
    }
  };

  const handleCrear = async () => {
    setError("");
    setSuccess("");

    if (!nuevaCita.paciente_id) {
      setError("Debe seleccionar un paciente");
      return;
    }
    if (!nuevaCita.medico_id) {
      setError("Debe seleccionar un médico");
      return;
    }
    if (!nuevaCita.fecha) {
      setError("Debe seleccionar una fecha");
      return;
    }
    if (!nuevaCita.hora) {
      setError("Debe seleccionar una hora");
      return;
    }

    const fechaSeleccionada = new Date(nuevaCita.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      setError("No se pueden agendar citas en fechas pasadas");
      return;
    }

    try {
      await api.post("/citas", nuevaCita);
      setSuccess("Cita creada exitosamente");
      setOpen(false);
      setNuevaCita({
        paciente_id: "",
        medico_id: "",
        fecha: "",
        hora: "",
        motivo_consulta: "",
        tipo_cita: "Consulta General",
      });
      cargarCitas();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear cita");
    }
  };

  const handleEditar = async () => {
    setError("");
    setSuccess("");
    if (!citaEditar.fecha || !citaEditar.hora) {
      setError("Fecha y hora son obligatorios");
      return;
    }
    try {
      await api.put(`/citas/${citaEditar.id}`, {
        fecha: citaEditar.fecha,
        hora: citaEditar.hora,
        tipo_cita: citaEditar.tipo_cita,
        motivo_consulta: citaEditar.motivo_consulta,
      });
      setSuccess("Cita actualizada exitosamente");
      setOpenEditar(false);
      cargarCitas();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al editar la cita");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta cita permanentemente?"))
      return;
    try {
      await api.delete(`/citas/${id}`);
      setSuccess("Cita eliminada exitosamente");
      cargarCitas();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar la cita");
    }
  };

  const handleCancelarCita = async (id) => {
    if (!window.confirm("¿Está seguro de cancelar esta cita?")) return;
    try {
      await api.put(`/citas/${id}/cancelar`);
      setSuccess("Cita cancelada exitosamente");
      cargarCitas();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cancelar la cita");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Citas - Centro de Salud San José</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2563eb; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .header { margin-bottom: 30px; }
            .date { color: #64748b; font-size: 14px; }
            .chip { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .chip-pendiente { background-color: #fef3c7; color: #f59e0b; }
            .chip-finalizada { background-color: #d1fae5; color: '#10b981'; }
            .chip-en_atencion { background-color: #dbeafe; color: #3b82f6; }
            .chip-cancelada { background-color: #fee2e2; color: #ef4444; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte de Citas Médicas</h1>
            <p class="date">Centro de Salud Comunitario San José - Aguascalientes</p>
            <p class="date">Generado: ${new Date().toLocaleString("es-MX")}</p>
            <p class="date">Total de citas: ${citas.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th><th>Hora</th><th>Paciente</th><th>Médico</th>
                <th>Especialidad</th><th>Tipo</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${citas
                .map(
                  (cita) => `
                <tr>
                  <td>${new Date(cita.fecha).toLocaleDateString("es-MX")}</td>
                  <td>${cita.hora}</td>
                  <td>${cita.paciente_nombre}</td>
                  <td>Dr. ${cita.medico_nombre}</td>
                  <td>${cita.especialidad_medico}</td>
                  <td>${cita.tipo_cita || "Consulta"}</td>
                  <td><span class="chip chip-${cita.estado}">${cita.estado.toUpperCase()}</span></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleLimpiarFiltros = () => {
    setFiltroMedico(null);
    setFiltroPaciente(null);
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: { bg: "#fef3c7", color: "#f59e0b" },
      finalizada: { bg: "#d1fae5", color: "#10b981" },
      en_atencion: { bg: "#dbeafe", color: "#3b82f6" },
      cancelada: { bg: "#fee2e2", color: "#ef4444" },
    };
    return colors[estado] || colors.pendiente;
  };

  const puedeEditar = (cita) => {
    return cita.estado !== "finalizada" && cita.estado !== "cancelada";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container
          maxWidth={false}
          sx={{ pt: 12, pb: 8, px: { xs: 4, md: 6 }, textAlign: "center" }}
        >
          <Typography>Cargando datos...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth={false} sx={{ pt: 12, pb: 8, px: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 6, mt: 2 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              mb: 1,
              fontSize: "2.5rem",
            }}
          >
            Gestión de Citas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las citas médicas del centro de salud
          </Typography>
        </Box>

        {/* FILTROS */}
        <Paper
          sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
              >
                Filtrar por Paciente
              </Typography>
              <Autocomplete
                fullWidth
                options={pacientes}
                getOptionLabel={(option) =>
                  `${option.nombre} ${option.apellido_paterno} ${option.apellido_materno}`
                }
                value={filtroPaciente}
                onChange={(e, newValue) => setFiltroPaciente(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Buscar paciente..."
                    variant="outlined"
                    size="small"
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
              >
                Fecha Inicio
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
              >
                Fecha Fin
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
              />
            </Grid>
            {usuario.rol === "administrativo" && (
              <Grid item xs={12} md={2}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Filtrar por Médico
                </Typography>
                <Autocomplete
                  fullWidth
                  options={medicos}
                  getOptionLabel={(option) =>
                    `Dr. ${option.nombre} ${option.apellido_paterno} - ${option.especialidad}`
                  }
                  value={filtroMedico}
                  onChange={(e, newValue) => setFiltroMedico(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar médico..."
                      variant="outlined"
                      size="small"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value?.id
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} md={3}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: "#0f172a",
                  visibility: "hidden",
                }}
              >
                Espacio
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={cargarCitas}
                  sx={{
                    bgcolor: "#2563eb",
                    "&:hover": { bgcolor: "#1d4ed8" },
                    py: 1.2,
                  }}
                >
                  Aplicar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleLimpiarFiltros}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              // Si es médico, asegurar que ya está seleccionado
              if (usuario.rol === "medico" && usuario.medico_id) {
                const miMedico = medicos.find(
                  (m) => m.id === usuario.medico_id,
                );
                if (miMedico) {
                  setNuevaCita((prev) => ({
                    ...prev,
                    medico_id: miMedico.id.toString(),
                    especialidad: miMedico.especialidad || "General",
                  }));
                }
              }
              setOpen(true);
            }}
            sx={{
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Nueva Cita
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ py: 1.5 }}
          >
            Imprimir Reporte
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hora</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Médico</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Especialidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay citas programadas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                citas.map((cita) => {
                  const estadoColors = getEstadoColor(cita.estado);
                  return (
                    <TableRow key={cita.id} hover>
                      <TableCell>
                        {new Date(cita.fecha).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {cita.hora}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {cita.paciente_nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Dr. {cita.medico_nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>{cita.especialidad_medico}</TableCell>
                      <TableCell>{cita.tipo_cita || "Consulta"}</TableCell>
                      <TableCell>
                        <Chip
                          label={cita.estado.toUpperCase()}
                          sx={{
                            bgcolor: estadoColors.bg,
                            color: estadoColors.color,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setCitaEditar(cita);
                            setOpenEditar(true);
                          }}
                          size="small"
                          disabled={!puedeEditar(cita)}
                          title="Editar"
                        >
                          <Edit />
                        </IconButton>
                        {cita.estado !== "cancelada" && (
                          <IconButton
                            color="error"
                            onClick={() => handleCancelarCita(cita.id)}
                            size="small"
                            disabled={!puedeEditar(cita)}
                            title="Cancelar"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog Nueva Cita */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "#2563eb",
              color: "white",
              fontWeight: 700,
              fontSize: "1.5rem",
              py: 2.5,
              px: 3,
            }}
          >
            Agendar Nueva Cita
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Paciente *
                </Typography>
                <Autocomplete
                  fullWidth
                  options={pacientes}
                  getOptionLabel={(option) =>
                    `${option.nombre} ${option.apellido_paterno} ${option.apellido_materno} - ${option.curp}`
                  }
                  value={
                    pacientes.find(
                      (p) => p.id === parseInt(nuevaCita.paciente_id),
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    setNuevaCita({
                      ...nuevaCita,
                      paciente_id: newValue?.id || "",
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar paciente..."
                      variant="outlined"
                      required
                    />
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Médico *
                </Typography>
                <Autocomplete
                  fullWidth
                  options={medicos}
                  getOptionLabel={(option) =>
                    `Dr. ${option.nombre} ${option.apellido_paterno} - ${option.especialidad}`
                  }
                  value={
                    medicos.find(
                      (m) => m.id === parseInt(nuevaCita.medico_id),
                    ) || null
                  }
                  onChange={(e, newValue) => {
                    setNuevaCita({
                      ...nuevaCita,
                      medico_id: newValue?.id || "",
                      especialidad: newValue?.especialidad || "",
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar médico..."
                      variant="outlined"
                      required
                    />
                  )}
                  disabled={usuario.rol === "medico"} // El médico no puede cambiar, solo se ve a sí mismo
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Especialidad
                </Typography>
                <TextField
                  fullWidth
                  value={nuevaCita.especialidad}
                  disabled
                  variant="outlined"
                  placeholder="Se autocompleta según el médico"
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Fecha *
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={nuevaCita.fecha}
                      onChange={(e) =>
                        setNuevaCita({ ...nuevaCita, fecha: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      required
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Hora *
                    </Typography>
                    <TextField
                      fullWidth
                      type="time"
                      value={nuevaCita.hora}
                      onChange={(e) =>
                        setNuevaCita({ ...nuevaCita, hora: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Tipo de Cita
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={nuevaCita.tipo_cita}
                  onChange={(e) =>
                    setNuevaCita({ ...nuevaCita, tipo_cita: e.target.value })
                  }
                  variant="outlined"
                >
                  <MenuItem value="Consulta General">Consulta General</MenuItem>
                  <MenuItem value="Control">Control</MenuItem>
                  <MenuItem value="Seguimiento">Seguimiento</MenuItem>
                  <MenuItem value="Urgencia">Urgencia</MenuItem>
                  <MenuItem value="Procedimiento">Procedimiento</MenuItem>
                </TextField>
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                >
                  Motivo de Consulta
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={nuevaCita.motivo_consulta}
                  onChange={(e) =>
                    setNuevaCita({
                      ...nuevaCita,
                      motivo_consulta: e.target.value,
                    })
                  }
                  variant="outlined"
                  placeholder="Describa el motivo de la cita..."
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
            <Button
              onClick={() => setOpen(false)}
              sx={{ color: "#64748b", fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCrear}
              variant="contained"
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                fontWeight: 600,
              }}
            >
              Confirmar Cita
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Cita */}
        <Dialog
          open={openEditar}
          onClose={() => setOpenEditar(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{ bgcolor: "#2563eb", color: "white", fontWeight: 700 }}
          >
            Editar Cita
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {citaEditar && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Fecha *
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={citaEditar.fecha}
                      onChange={(e) =>
                        setCitaEditar({ ...citaEditar, fecha: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Hora *
                    </Typography>
                    <TextField
                      fullWidth
                      type="time"
                      value={citaEditar.hora}
                      onChange={(e) =>
                        setCitaEditar({ ...citaEditar, hora: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Tipo de Cita
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={citaEditar.tipo_cita}
                    onChange={(e) =>
                      setCitaEditar({
                        ...citaEditar,
                        tipo_cita: e.target.value,
                      })
                    }
                    variant="outlined"
                  >
                    <MenuItem value="Consulta General">
                      Consulta General
                    </MenuItem>
                    <MenuItem value="Control">Control</MenuItem>
                    <MenuItem value="Seguimiento">Seguimiento</MenuItem>
                    <MenuItem value="Urgencia">Urgencia</MenuItem>
                    <MenuItem value="Procedimiento">Procedimiento</MenuItem>
                  </TextField>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Motivo de Consulta
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={citaEditar.motivo_consulta}
                    onChange={(e) =>
                      setCitaEditar({
                        ...citaEditar,
                        motivo_consulta: e.target.value,
                      })
                    }
                    variant="outlined"
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
            <Button
              onClick={() => setOpenEditar(false)}
              sx={{ color: "#64748b" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditar}
              variant="contained"
              sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
            >
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Citas;

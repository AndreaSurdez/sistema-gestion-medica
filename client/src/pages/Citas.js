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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add,
  FilterList,
  Print,
  Edit,
  Delete,
  Clear,
  CalendarMonth,
  ViewList,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Imports de FullCalendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

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
    especialidad: "",
  });
  const [citaEditar, setCitaEditar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtros
  const [filtroMedico, setFiltroMedico] = useState(null);
  const [filtroPaciente, setFiltroPaciente] = useState(null);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");

  const [loading, setLoading] = useState(false);
  const [vista, setVista] = useState("lista"); // 'lista' o 'calendario'

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const pacientesRes = await api.get("/pacientes");
      setPacientes(pacientesRes.data);

      let listaMedicos = [];
      if (usuario.rol === "administrativo") {
        const medicosRes = await api.get("/medicos");
        listaMedicos = medicosRes.data;
      } else if (usuario.rol === "medico") {
        const miInfo = await api.get("/perfil");
        listaMedicos = [
          {
            id: miInfo.data.medico_id,
            nombre: miInfo.data.medico_nombre || "Yo",
            apellido_paterno: miInfo.data.medico_apellido || "",
            especialidad: miInfo.data.especialidad || "General",
          },
        ];
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
      if (usuario.rol === "medico" && usuario.medico_id)
        medicoId = usuario.medico_id;

      const params = {};
      if (medicoId) params.medico_id = medicoId;
      if (filtroFechaInicio) params.fecha_inicio = filtroFechaInicio;
      if (filtroFechaFin) params.fecha_fin = filtroFechaFin;
      if (filtroPaciente?.id) params.paciente_id = filtroPaciente.id;
      if (filtroEspecialidad) params.especialidad = filtroEspecialidad;

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
    if (
      !nuevaCita.paciente_id ||
      !nuevaCita.medico_id ||
      !nuevaCita.fecha ||
      !nuevaCita.hora
    ) {
      setError("Complete todos los campos obligatorios");
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
        especialidad: "",
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

  const handleLimpiarFiltros = () => {
    setFiltroMedico(null);
    setFiltroPaciente(null);
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    setFiltroEspecialidad("");
    cargarCitas();
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

  const puedeEditar = (cita) =>
    cita.estado !== "finalizada" && cita.estado !== "cancelada";

  const eventosCalendario = citas.map((cita) => ({
    id: cita.id,
    title: `${cita.paciente_nombre} (${cita.tipo_cita})`,
    start: `${cita.fecha}T${cita.hora}`,
    backgroundColor: getEstadoColor(cita.estado).bg,
    borderColor: getEstadoColor(cita.estado).color,
    textColor: getEstadoColor(cita.estado).color,
    extendedProps: { ...cita },
  }));

  const especialidadesUnicas = [
    ...new Set(medicos.map((m) => m.especialidad).filter(Boolean)),
  ];

  if (loading)
    return (
      <>
        <Navbar />
        <Container sx={{ pt: 12, textAlign: "center" }}>
          <Typography>Cargando...</Typography>
        </Container>
      </>
    );

  return (
    <>
      <Navbar />
      <Container maxWidth={false} sx={{ pt: 12, pb: 8, px: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Gestión de Citas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra las citas médicas del centro de salud
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={vista}
            exclusive
            onChange={(e, v) => v && setVista(v)}
            sx={{ bgcolor: "#f1f5f9", borderRadius: 2 }}
          >
            <ToggleButton
              value="lista"
              sx={{
                border: "none",
                "&.Mui-selected": { bgcolor: "#2563eb", color: "white" },
              }}
            >
              <ViewList sx={{ mr: 1 }} /> Lista
            </ToggleButton>
            <ToggleButton
              value="calendario"
              sx={{
                border: "none",
                "&.Mui-selected": { bgcolor: "#2563eb", color: "white" },
              }}
            >
              <CalendarMonth sx={{ mr: 1 }} /> Calendario
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* FILTROS */}
        <Paper
          sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.5}>
              <Autocomplete
                size="small"
                options={pacientes}
                getOptionLabel={(o) => `${o.nombre} ${o.apellido_paterno}`}
                value={filtroPaciente}
                onChange={(e, v) => setFiltroPaciente(v)}
                renderInput={(p) => <TextField {...p} label="Paciente" />}
              />
            </Grid>
            {usuario.rol === "administrativo" && (
              <Grid item xs={12} md={2.5}>
                <Autocomplete
                  size="small"
                  options={medicos}
                  getOptionLabel={(o) =>
                    `Dr. ${o.nombre} ${o.apellido_paterno}`
                  }
                  value={filtroMedico}
                  onChange={(e, v) => setFiltroMedico(v)}
                  renderInput={(p) => <TextField {...p} label="Médico" />}
                />
              </Grid>
            )}
            <Grid item xs={12} md={2}>
              <TextField
                select
                size="small"
                fullWidth
                label="Especialidad"
                value={filtroEspecialidad}
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {especialidadesUnicas.map((esp, idx) => (
                  <MenuItem key={idx} value={esp}>
                    {esp}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                size="small"
                fullWidth
                label="Desde"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                size="small"
                fullWidth
                label="Hasta"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Box sx={{ display: "flex", gap: 1, height: "100%" }}>
                <Button
                  variant="contained"
                  onClick={cargarCitas}
                  sx={{ bgcolor: "#2563eb", minWidth: "40px", p: 1 }}
                >
                  <FilterList />
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleLimpiarFiltros}
                  sx={{ minWidth: "40px", p: 1 }}
                >
                  <Clear />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ bgcolor: "#2563eb" }}
          >
            Nueva Cita
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

        {vista === "lista" ? (
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
                  <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {citas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No hay citas programadas
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
                        <TableCell>{cita.paciente_nombre}</TableCell>
                        <TableCell>Dr. {cita.medico_nombre}</TableCell>
                        <TableCell>{cita.especialidad_medico}</TableCell>
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
                          >
                            <Edit />
                          </IconButton>
                          {cita.estado !== "cancelada" && (
                            <IconButton
                              color="error"
                              onClick={() => handleCancelarCita(cita.id)}
                              size="small"
                              disabled={!puedeEditar(cita)}
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
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              events={eventosCalendario}
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek",
              }}
              eventClick={(info) => {
                const cita = info.event.extendedProps;
                setCitaEditar(cita);
                setOpenEditar(true);
              }}
            />
          </Paper>
        )}

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
              py: 2.5,
              px: 3,
            }}
          >
            Agendar Nueva Cita
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
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
                  disabled={usuario.rol === "medico"}
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

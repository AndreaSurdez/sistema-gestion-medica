import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Box,
  Grid,
  Chip,
  MenuItem,
} from "@mui/material";
import { Add, Delete, Edit, Print, Clear } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import {
  listarMedicos,
  crearMedico,
  eliminarMedico,
} from "../services/medicosService";
import { useAuth } from "../context/AuthContext";

const Medicos = () => {
  const { usuario } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    cedula_profesional: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    especialidad: "",
    email: "",
    telefono: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  useEffect(() => {
    cargarMedicos();
  }, []);

  const cargarMedicos = async () => {
    try {
      const data = await listarMedicos();
      setMedicos(data);
    } catch (error) {
      console.error("Error al cargar médicos:", error);
      setError("Error al cargar los médicos");
    }
  };

  // FUNCIONES DE VALIDACIÓN
  const validateText = (str) => {
    return str.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  };

  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const validarCedula = (cedula) => {
    const cedulaLimpia = cedula.replace(/\D/g, "");
    if (cedulaLimpia.length < 6 || cedulaLimpia.length > 10) {
      return "La cédula profesional debe tener entre 6 y 10 dígitos";
    }
    return null;
  };

  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "El email no es válido";
    }
    return null;
  };

  const validarTelefono = (telefono) => {
    if (!telefono) return null;
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 10) {
      return "El teléfono debe tener exactamente 10 dígitos";
    }
    return null;
  };

  const handleGuardar = async () => {
    setError("");
    setSuccess("");

    if (!formData.cedula_profesional.trim()) {
      setError("La cédula profesional es obligatoria");
      return;
    }
    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!formData.apellido_paterno.trim()) {
      setError("El apellido paterno es obligatorio");
      return;
    }
    if (!formData.especialidad.trim()) {
      setError("La especialidad es obligatoria");
      return;
    }
    if (!formData.email.trim()) {
      setError("El email es obligatorio");
      return;
    }

    const cedulaError = validarCedula(formData.cedula_profesional);
    if (cedulaError) {
      setError(cedulaError);
      return;
    }

    const emailError = validarEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (formData.telefono) {
      const telError = validarTelefono(formData.telefono);
      if (telError) {
        setError(telError);
        return;
      }
    }

    try {
      if (editing) {
        setSuccess("Médico actualizado exitosamente");
      } else {
        await crearMedico(formData);
        setSuccess("Médico registrado exitosamente");
      }

      setOpen(false);
      setEditing(null);
      setFormData({
        cedula_profesional: "",
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        especialidad: "",
        email: "",
        telefono: "",
      });
      cargarMedicos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Ya existe un médico con esa cédula o email");
      } else {
        setError(err.response?.data?.error || "Error al guardar el médico");
      }
    }
  };

  const handleEditar = (medico) => {
    setEditing(medico.id);
    setFormData({
      cedula_profesional: medico.cedula_profesional || "",
      nombre: medico.nombre || "",
      apellido_paterno: medico.apellido_paterno || "",
      apellido_materno: medico.apellido_materno || "",
      especialidad: medico.especialidad || "",
      email: medico.email || "",
      telefono: medico.telefono || "",
    });
    setOpen(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar al Dr. ${nombre}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    try {
      await eliminarMedico(id);
      setSuccess("Médico eliminado exitosamente");
      cargarMedicos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el médico");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Lista de Médicos - Centro de Salud San José</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2563eb; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .header { margin-bottom: 30px; }
            .date { color: #64748b; font-size: 14px; }
            .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Médicos</h1>
            <p class="date"><strong>Centro de Salud Comunitario San José</strong></p>
            <p class="date">Aguascalientes, México</p>
            <p class="date">Generado: ${new Date().toLocaleString("es-MX")}</p>
            <p class="date">Total de médicos: ${medicos.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cédula Profesional</th>
                <th>Nombre Completo</th>
                <th>Especialidad</th>
                <th>Email</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              ${medicos
                .map(
                  (m, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${m.cedula_profesional}</td>
                  <td>Dr. ${m.nombre} ${m.apellido_paterno} ${m.apellido_materno || ""}</td>
                  <td>${m.especialidad}</td>
                  <td>${m.email || "-"}</td>
                  <td>${m.telefono || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            <p>Documento generado automáticamente por el Sistema de Gestión Médica</p>
            <p>Centro de Salud Comunitario San José - Aguascalientes</p>
          </div>
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
    setFiltroBusqueda("");
  };

  const medicosFiltrados = medicos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      m.apellido_paterno.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      m.cedula_profesional
        .toLowerCase()
        .includes(filtroBusqueda.toLowerCase()) ||
      m.especialidad.toLowerCase().includes(filtroBusqueda.toLowerCase()),
  );

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
            Gestión de Médicos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra el personal médico del centro de salud
          </Typography>
        </Box>

        <Paper
          sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, cédula o especialidad..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleLimpiarFiltros}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setFormData({
                cedula_profesional: "",
                nombre: "",
                apellido_paterno: "",
                apellido_materno: "",
                especialidad: "",
                email: "",
                telefono: "",
              });
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
            Nuevo Médico
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ py: 1.5 }}
          >
            Imprimir Lista
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
                <TableCell sx={{ fontWeight: 700 }}>Cédula</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Especialidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay médicos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                medicosFiltrados.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.cedula_profesional}</TableCell>
                    <TableCell>
                      Dr. {m.nombre} {m.apellido_paterno} {m.apellido_materno}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.especialidad}
                        size="small"
                        sx={{
                          bgcolor: "#dbeafe",
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.telefono || "-"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditar(m)}
                        size="small"
                        title="Editar"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleEliminar(
                            m.id,
                            `${m.nombre} ${m.apellido_paterno}`,
                          )
                        }
                        size="small"
                        title="Eliminar"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog Formulario */}
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
            {editing ? "Editar Médico" : "Registrar Nuevo Médico"}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Cédula Profesional *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.cedula_profesional}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData({ ...formData, cedula_profesional: value });
                    }}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      minLength: 6,
                      maxLength: 10,
                    }}
                    placeholder="1234567"
                    helperText={`${formData.cedula_profesional.length} dígitos (mínimo 6, máximo 10)`}
                    disabled={!!editing}
                    error={
                      formData.cedula_profesional.length > 0 &&
                      (formData.cedula_profesional.length < 6 ||
                        formData.cedula_profesional.length > 10)
                    }
                    variant="outlined"
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
                    Especialidad *
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={formData.especialidad}
                    onChange={(e) =>
                      setFormData({ ...formData, especialidad: e.target.value })
                    }
                    variant="outlined"
                    SelectProps={{ native: false }}
                    error={!formData.especialidad}
                    helperText={
                      !formData.especialidad ? "Campo obligatorio" : ""
                    }
                    required
                  >
                    <MenuItem value="">Seleccione una especialidad</MenuItem>
                    <MenuItem value="Medicina General">
                      Medicina General
                    </MenuItem>
                    <MenuItem value="Pediatría">Pediatría</MenuItem>
                    <MenuItem value="Odontología">Odontología</MenuItem>
                    <MenuItem value="Cardiología">Cardiología</MenuItem>
                    <MenuItem value="Dermatología">Dermatología</MenuItem>
                    <MenuItem value="Ginecología">Ginecología</MenuItem>
                    <MenuItem value="Traumatología">Traumatología</MenuItem>
                    <MenuItem value="Neurología">Neurología</MenuItem>
                  </TextField>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Nombre *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.nombre}
                    onChange={(e) => {
                      const value = validateText(e.target.value);
                      setFormData({
                        ...formData,
                        nombre: capitalizeFirst(value),
                      });
                    }}
                    placeholder="Ej: Juan"
                    variant="outlined"
                    error={formData.nombre && /\d/.test(formData.nombre)}
                    helperText={
                      formData.nombre && /\d/.test(formData.nombre)
                        ? "Solo letras"
                        : ""
                    }
                    required
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Apellido Paterno *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.apellido_paterno}
                    onChange={(e) => {
                      const value = validateText(e.target.value);
                      setFormData({
                        ...formData,
                        apellido_paterno: capitalizeFirst(value),
                      });
                    }}
                    placeholder="Ej: Pérez"
                    variant="outlined"
                    error={
                      formData.apellido_paterno &&
                      /\d/.test(formData.apellido_paterno)
                    }
                    helperText={
                      formData.apellido_paterno &&
                      /\d/.test(formData.apellido_paterno)
                        ? "Solo letras"
                        : ""
                    }
                    required
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Apellido Materno
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.apellido_materno}
                    onChange={(e) => {
                      const value = validateText(e.target.value);
                      setFormData({
                        ...formData,
                        apellido_materno: capitalizeFirst(value),
                      });
                    }}
                    placeholder="Ej: García"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Email *
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@sanjose.mx"
                    variant="outlined"
                    required
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Teléfono
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefono: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      })
                    }
                    placeholder="4491234567"
                    helperText={`${formData.telefono.replace(/\D/g, "").length}/10 dígitos`}
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
            <Button
              onClick={() => setOpen(false)}
              sx={{ color: "#64748b", fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              variant="contained"
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                fontWeight: 600,
              }}
            >
              {editing ? "Actualizar" : "Guardar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Medicos;

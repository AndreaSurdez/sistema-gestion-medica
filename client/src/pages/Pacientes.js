import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  MenuItem,
} from "@mui/material";
import {
  Visibility,
  Add,
  Edit,
  Delete,
  Print,
  Clear,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import {
  listarPacientes,
  registrarPaciente,
  actualizarPaciente,
} from "../services/pacientesService";
import { useAuth } from "../context/AuthContext";

const Pacientes = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    curp: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    direccion: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const data = await listarPacientes();
      setPacientes(data);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
      setError("Error al cargar los pacientes");
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

  const validarCURP = (curp) => {
    const curpLimpio = curp.toUpperCase().replace(/\s/g, "");
    if (curpLimpio.length !== 18) {
      return "El CURP debe tener exactamente 18 caracteres";
    }
    if (!/^[A-Z0-9]{18}$/.test(curpLimpio)) {
      return "El CURP solo puede contener letras mayúsculas y números";
    }
    return null;
  };

  const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 10) {
      return "El teléfono debe tener exactamente 10 dígitos";
    }
    return null;
  };

  const validarEmail = (email) => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "El email no es válido";
    }
    return null;
  };

  const validarFechaNacimiento = (fecha) => {
    const fechaNac = new Date(fecha);
    const hoy = new Date();
    if (fechaNac > hoy) {
      return "La fecha de nacimiento no puede ser futura";
    }
    const edad = (hoy - fechaNac) / (365.25 * 24 * 60 * 60 * 1000);
    if (edad < 0 || edad > 120) {
      return "Fecha de nacimiento inválida";
    }
    return null;
  };

  const validarCodigoPostal = (cp) => {
    if (!cp) return null;
    const cpLimpio = cp.replace(/\D/g, "");
    if (cpLimpio.length !== 5) {
      return "El código postal debe tener 5 dígitos";
    }
    return null;
  };

  const handleGuardar = async () => {
    setError("");
    setSuccess("");

    if (!formData.curp.trim()) {
      setError("El CURP es obligatorio");
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
    if (!formData.fecha_nacimiento) {
      setError("La fecha de nacimiento es obligatoria");
      return;
    }

    const curpError = validarCURP(formData.curp);
    if (curpError) {
      setError(curpError);
      return;
    }

    const fechaError = validarFechaNacimiento(formData.fecha_nacimiento);
    if (fechaError) {
      setError(fechaError);
      return;
    }

    if (formData.telefono) {
      const telError = validarTelefono(formData.telefono);
      if (telError) {
        setError(telError);
        return;
      }
    }

    if (formData.email) {
      const emailError = validarEmail(formData.email);
      if (emailError) {
        setError(emailError);
        return;
      }
    }

    if (formData.codigo_postal) {
      const cpError = validarCodigoPostal(formData.codigo_postal);
      if (cpError) {
        setError(cpError);
        return;
      }
    }

    try {
      if (editing) {
        await actualizarPaciente(editing, formData);
        setSuccess("Paciente actualizado exitosamente");
      } else {
        await registrarPaciente(formData);
        setSuccess("Paciente registrado exitosamente");
      }

      setOpen(false);
      setEditing(null);
      setFormData({
        curp: "",
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        fecha_nacimiento: "",
        sexo: "",
        telefono: "",
        email: "",
        direccion: "",
        colonia: "",
        ciudad: "",
        estado: "",
        codigo_postal: "",
      });
      cargarPacientes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("El CURP ya está registrado en el sistema");
      } else {
        setError(err.response?.data?.error || "Error al guardar el paciente");
      }
    }
  };

  const handleEditar = (paciente) => {
    setEditing(paciente.id);
    setFormData({
      curp: paciente.curp || "",
      nombre: paciente.nombre || "",
      apellido_paterno: paciente.apellido_paterno || "",
      apellido_materno: paciente.apellido_materno || "",
      fecha_nacimiento: paciente.fecha_nacimiento
        ? new Date(paciente.fecha_nacimiento).toISOString().split("T")[0]
        : "",
      sexo: paciente.sexo || "",
      telefono: paciente.telefono || "",
      email: paciente.email || "",
      direccion: paciente.direccion || "",
      colonia: paciente.colonia || "",
      ciudad: paciente.ciudad || "",
      estado: paciente.estado || "",
      codigo_postal: paciente.codigo_postal || "",
    });
    setOpen(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar al paciente ${nombre}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    try {
      setSuccess("Paciente eliminado exitosamente");
      cargarPacientes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el paciente");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Lista de Pacientes - Centro de Salud San José</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2563eb; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .header { margin-bottom: 30px; }
            .date { color: #64748b; font-size: 14px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Pacientes</h1>
            <p class="date">Centro de Salud Comunitario San José - Aguascalientes</p>
            <p class="date">Generado: ${new Date().toLocaleString("es-MX")}</p>
            <p class="date">Total de pacientes: ${pacientes.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>CURP</th>
                <th>Nombre Completo</th>
                <th>Fecha Nacimiento</th>
                <th>Teléfono</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${pacientes
                .map(
                  (p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.curp}</td>
                  <td>${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}</td>
                  <td>${p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString("es-MX") : "-"}</td>
                  <td>${p.telefono || "-"}</td>
                  <td>${p.email || "-"}</td>
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
    setFiltroBusqueda("");
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      p.apellido_paterno.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      p.curp.toLowerCase().includes(filtroBusqueda.toLowerCase()),
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
            Gestión de Pacientes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra la información de los pacientes del centro
          </Typography>
        </Box>

        <Paper
          sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, apellido o CURP..."
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
                curp: "",
                nombre: "",
                apellido_paterno: "",
                apellido_materno: "",
                fecha_nacimiento: "",
                sexo: "",
                telefono: "",
                email: "",
                direccion: "",
                colonia: "",
                ciudad: "",
                estado: "",
                codigo_postal: "",
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
            Nuevo Paciente
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
                <TableCell sx={{ fontWeight: 700 }}>CURP</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nombre Completo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha Nacimiento</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pacientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay pacientes registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pacientesFiltrados.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.curp}</TableCell>
                    <TableCell>
                      {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                    </TableCell>
                    <TableCell>
                      {p.fecha_nacimiento
                        ? new Date(p.fecha_nacimiento).toLocaleDateString(
                            "es-MX",
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>{p.telefono || "-"}</TableCell>
                    <TableCell>{p.email || "-"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditar(p)}
                        size="small"
                        title="Editar"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/historial/${p.id}`)}
                        size="small"
                        title="Ver historial"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleEliminar(
                            p.id,
                            `${p.nombre} ${p.apellido_paterno}`,
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
            {editing ? "Editar Paciente" : "Registrar Nuevo Paciente"}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    CURP *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.curp}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 18);
                      setFormData({ ...formData, curp: value });
                    }}
                    placeholder="MEGA850315MAGRNNA9"
                    inputProps={{ maxLength: 18 }}
                    disabled={!!editing}
                    helperText={`${formData.curp.length}/18 caracteres${formData.curp.length !== 18 ? " - Debe tener 18" : " ✓"}`}
                    variant="outlined"
                    error={
                      formData.curp.length > 0 && formData.curp.length !== 18
                    }
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
                    Fecha de Nacimiento *
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: new Date().toISOString().split("T")[0] }}
                    variant="outlined"
                    error={
                      formData.fecha_nacimiento &&
                      new Date(formData.fecha_nacimiento) > new Date()
                    }
                    helperText={
                      formData.fecha_nacimiento &&
                      new Date(formData.fecha_nacimiento) > new Date()
                        ? "No puede ser futura"
                        : ""
                    }
                  />
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
                    placeholder="Ej: María"
                    variant="outlined"
                    error={formData.nombre && /\d/.test(formData.nombre)}
                    helperText={
                      formData.nombre && /\d/.test(formData.nombre)
                        ? "Solo letras"
                        : ""
                    }
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
                    placeholder="Ej: García"
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
                    placeholder="Ej: López"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Sexo
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={formData.sexo}
                    onChange={(e) =>
                      setFormData({ ...formData, sexo: e.target.value })
                    }
                    variant="outlined"
                    SelectProps={{ native: false }}
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                    <MenuItem value="Masculino">Masculino</MenuItem>
                  </TextField>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
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
                    Dirección
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        direccion: capitalizeFirst(
                          validateText(e.target.value),
                        ),
                      })
                    }
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Colonia
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.colonia}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colonia: capitalizeFirst(validateText(e.target.value)),
                      })
                    }
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Ciudad
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.ciudad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ciudad: capitalizeFirst(validateText(e.target.value)),
                      })
                    }
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                  >
                    Código Postal
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.codigo_postal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codigo_postal: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 5),
                      })
                    }
                    placeholder="20000"
                    helperText={`${formData.codigo_postal.replace(/\D/g, "").length}/5 dígitos`}
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

export default Pacientes;

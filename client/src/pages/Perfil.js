import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { Edit, Save, Cancel, Lock, Security } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
} from "../services/perfilService";

const Perfil = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [editando, setEditando] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [perfil, setPerfil] = useState(null);
  const [formData, setFormData] = useState({ email: "", telefono: "" });
  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    passwordNuevo: "",
    passwordConfirmar: "",
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const data = await obtenerPerfil();
      setPerfil(data);
      setFormData({
        email: data.email || "",
        telefono: data.telefono || "",
      });
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setError("Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.email.trim()) {
      setError("El email es obligatorio");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("El email no es válido");
      return;
    }
    if (!formData.telefono.trim()) {
      setError("El teléfono es obligatorio");
      return;
    }
    if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ""))) {
      setError("El teléfono debe tener 10 dígitos");
      return;
    }

    setError("");
    setSuccess("");
    try {
      await actualizarPerfil(formData);
      setSuccess("Perfil actualizado exitosamente");
      setEditando(false);
      cargarPerfil();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el perfil");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!passwordData.passwordActual) {
      setError("La contraseña actual es obligatoria");
      return;
    }
    if (!passwordData.passwordNuevo) {
      setError("La nueva contraseña es obligatoria");
      return;
    }
    if (passwordData.passwordNuevo.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (passwordData.passwordNuevo !== passwordData.passwordConfirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await cambiarPassword({
        passwordActual: passwordData.passwordActual,
        passwordNuevo: passwordData.passwordNuevo,
      });
      setSuccess("Contraseña actualizada exitosamente");
      setCambiandoPassword(false);
      setPasswordData({
        passwordActual: "",
        passwordNuevo: "",
        passwordConfirmar: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 14, mb: 6, textAlign: "center" }}>
          <Typography>Cargando perfil...</Typography>
        </Container>
      </>
    );
  }

  const nombreCompleto = perfil?.medico_nombre
    ? `${perfil.medico_nombre} ${perfil.medico_apellido || ""}`
    : perfil?.paciente_nombre
      ? `${perfil.paciente_nombre} ${perfil.paciente_apellido || ""}`
      : usuario?.username || "Usuario";

  return (
    <>
      <Navbar />
      <Container maxWidth={false} sx={{ pt: 12, pb: 8, px: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              mb: 1,
              fontSize: "2.5rem",
            }}
          >
            Mi Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tu información personal y seguridad
          </Typography>
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

        {/* LAYOUT LADO A LADO */}
        <Grid container spacing={4}>
          {/* IZQUIERDA: Tarjeta de Perfil */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#2563eb",
                  fontSize: 48,
                  fontWeight: 700,
                  mx: "auto",
                  mb: 3,
                }}
              >
                {nombreCompleto.substring(0, 2).toUpperCase()}
              </Avatar>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}
              >
                {nombreCompleto}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, textTransform: "capitalize" }}
              >
                {perfil?.rol === "administrativo"
                  ? "Administrativo"
                  : perfil?.rol === "medico"
                    ? "Médico"
                    : "Paciente"}
              </Typography>
              {perfil?.especialidad && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {perfil.especialidad}
                </Typography>
              )}
              <Divider sx={{ my: 3 }} />
              <Button
                fullWidth
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditando(!editando)}
                sx={{
                  bgcolor: editando ? "#64748b" : "#2563eb",
                  "&:hover": { bgcolor: editando ? "#475569" : "#1d4ed8" },
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                {editando ? "Cancelar Edición" : "Editar Perfil"}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Lock />}
                onClick={() => setCambiandoPassword(!cambiandoPassword)}
                sx={{
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  borderRadius: 2,
                  mb: 2,
                  "&:hover": { bgcolor: "#dbeafe" },
                }}
              >
                Cambiar Contraseña
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Security />}
                onClick={handleLogout}
                sx={{ borderRadius: 2 }}
              >
                Cerrar Sesión
              </Button>
            </Paper>
          </Grid>

          {/* DERECHA: Información y formularios */}
          <Grid item xs={12} md={8}>
            {/* Información Personal */}
            <Paper
              elevation={0}
              sx={{ p: 4, borderRadius: 3, border: "1px solid #e2e8f0", mb: 4 }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, mb: 3, color: "#0f172a" }}
              >
                Información Personal
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Usuario
                    </Typography>
                    <TextField
                      fullWidth
                      value={perfil?.username || ""}
                      disabled
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Rol
                    </Typography>
                    <TextField
                      fullWidth
                      value={
                        perfil?.rol === "administrativo"
                          ? "Administrativo"
                          : perfil?.rol === "medico"
                            ? "Médico"
                            : "Paciente"
                      }
                      disabled
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Email *
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!editando}
                      variant="outlined"
                      placeholder="correo@ejemplo.com"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Teléfono *
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      disabled={!editando}
                      variant="outlined"
                      placeholder="4491234567"
                    />
                  </Box>
                </Grid>
              </Grid>

              {editando && (
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setEditando(false);
                      setFormData({
                        email: perfil?.email || "",
                        telefono: perfil?.telefono || "",
                      });
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{
                      bgcolor: "#2563eb",
                      "&:hover": { bgcolor: "#1d4ed8" },
                      borderRadius: 2,
                    }}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Cambiar Contraseña */}
            {cambiandoPassword && (
              <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 3, border: "1px solid #e2e8f0" }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 3, color: "#0f172a" }}
                >
                  Cambiar Contraseña
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Contraseña Actual *
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={passwordData.passwordActual}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          passwordActual: e.target.value,
                        })
                      }
                      variant="outlined"
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Nueva Contraseña *
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={passwordData.passwordNuevo}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          passwordNuevo: e.target.value,
                        })
                      }
                      variant="outlined"
                      helperText="Mínimo 6 caracteres"
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}
                    >
                      Confirmar Nueva Contraseña *
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={passwordData.passwordConfirmar}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          passwordConfirmar: e.target.value,
                        })
                      }
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setCambiandoPassword(false);
                      setPasswordData({
                        passwordActual: "",
                        passwordNuevo: "",
                        passwordConfirmar: "",
                      });
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    sx={{
                      bgcolor: "#2563eb",
                      "&:hover": { bgcolor: "#1d4ed8" },
                      borderRadius: 2,
                    }}
                  >
                    Actualizar Contraseña
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Perfil;

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventIcon,
  Logout,
  MedicalServices,
  Person as PersonIcon,
  LocalHospital,
} from "@mui/icons-material";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  const esAdmin = usuario?.rol === "administrativo";
  const esMedico = usuario?.rol === "medico";
  const esPaciente = usuario?.rol === "paciente";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#2563eb",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
            onClick={() =>
              navigate(esPaciente ? "/portal-paciente" : "/dashboard")
            }
          >
            <MedicalServices sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "1.1rem",
                lineHeight: 1.2,
              }}
            >
              Sistema de Gestión Médica
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                display: "block",
              }}
            >
              Centro de Salud San José
            </Typography>
          </Box>
        </Box>

        {/* Navegación según rol */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {/* ADMIN: Ve todo */}
          {esAdmin && (
            <>
              <Button
                startIcon={<DashboardIcon />}
                onClick={() => navigate("/dashboard")}
                sx={{
                  color: "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { bgcolor: "#f1f5f9", color: "#2563eb" },
                }}
              >
                Dashboard
              </Button>
              <Button
                startIcon={<PeopleIcon />}
                onClick={() => navigate("/pacientes")}
                sx={{
                  color: "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { bgcolor: "#f1f5f9", color: "#2563eb" },
                }}
              >
                Pacientes
              </Button>
              <Button
                startIcon={<LocalHospital />}
                onClick={() => navigate("/medicos")}
                sx={{
                  color: "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { bgcolor: "#f1f5f9", color: "#2563eb" },
                }}
              >
                Médicos
              </Button>
              <Button
                startIcon={<EventIcon />}
                onClick={() => navigate("/citas")}
                sx={{
                  color: "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { bgcolor: "#f1f5f9", color: "#2563eb" },
                }}
              >
                Citas
              </Button>
            </>
          )}

          {/* MÉDICO: Solo ve su agenda y citas */}
          {esMedico && (
            <>
              <Button
                startIcon={<DashboardIcon />}
                onClick={() => navigate("/dashboard")}
                sx={{
                  color: "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { bgcolor: "#f1f5f9", color: "#2563eb" },
                }}
              >
                Mi Agenda
              </Button>
              <Button
                startIcon={<EventIcon />}
                onClick={() => navigate("/citas")}
                sx={{
                  color: "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { bgcolor: "#f1f5f9", color: "#2563eb" },
                }}
              >
                Citas
              </Button>
            </>
          )}

          {/* PACIENTE: Solo ve su portal */}
          {esPaciente && (
            <Button
              startIcon={<PersonIcon />}
              onClick={() => navigate("/portal-paciente")}
              sx={{
                color: "#475569",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                "&:hover": { bgcolor: "#f1f5f9", color: "#2563eb" },
              }}
            >
              Mi Portal
            </Button>
          )}
        </Box>

        {/* Perfil del usuario */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#0f172a" }}
            >
              {usuario?.username || "Usuario"}
            </Typography>
            <Chip
              label={
                usuario?.rol === "administrativo"
                  ? "Administrativo"
                  : usuario?.rol === "medico"
                    ? "Médico"
                    : "Paciente"
              }
              size="small"
              sx={{
                bgcolor:
                  usuario?.rol === "administrativo"
                    ? "#dbeafe"
                    : usuario?.rol === "medico"
                      ? "#dcfce7"
                      : "#fef3c7",
                color:
                  usuario?.rol === "administrativo"
                    ? "#2563eb"
                    : usuario?.rol === "medico"
                      ? "#16a34a"
                      : "#f59e0b",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 20,
              }}
            />
          </Box>
          <Avatar
            sx={{
              bgcolor: "#2563eb",
              width: 40,
              height: 40,
              fontWeight: 700,
              cursor: "pointer",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
            onClick={() => navigate("/perfil")}
            title="Ver perfil"
          >
            {getInitials(usuario?.username)}
          </Avatar>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "#64748b",
              "&:hover": { bgcolor: "#fee2e2", color: "#dc2626" },
            }}
          >
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

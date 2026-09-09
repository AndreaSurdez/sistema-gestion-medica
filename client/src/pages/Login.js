import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  MedicalServices,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      const rol = result.usuario?.rol;

      if (rol === "paciente") {
        navigate("/portal-paciente");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "#f8fafc",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: "center",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#2563eb",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <MedicalServices sx={{ fontSize: 40, color: "white" }} />
          </Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 1, color: "#0f172a" }}
          >
            Sistema de Gestión Médica
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Centro de Salud Comunitario San José
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 4 }}
          >
            Aguascalientes, México
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.5,
                fontSize: "1rem",
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: "#f1f5f9", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Credenciales de prueba:
            </Typography>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Admin: admin / admin123
            </Typography><br></br>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Médico: jperez / admin123
            </Typography><br></br>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Paciente: ana.martinez / admin123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

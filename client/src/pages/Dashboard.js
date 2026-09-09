import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  People,
  AccessTime,
  CheckCircle,
  EventNote,
  CalendarToday,
  TrendingUp,
  Print,
  Visibility,
  Edit,
  Cancel,
  Close,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import api from "../services/api";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [citas, setCitas] = useState([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [stats, setStats] = useState({
    pendientes: 0,
    finalizadas: 0,
    enAtencion: 0,
    canceladas: 0,
  });
  const [citasPorEspecialidad, setCitasPorEspecialidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filtroFechaFin, setFiltroFechaFin] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [citaEditar, setCitaEditar] = useState(null);
  const [graficaExpandida, setGraficaExpandida] = useState(null);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroFechaInicio, filtroFechaFin]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      // Actualizar estados automáticos
      await api.post("/estados/actualizar");

      const statsResponse = await api.get("/dashboard/estadisticas", {
        params: { fecha_inicio: filtroFechaInicio, fecha_fin: filtroFechaFin },
      });
      const { totalPacientes, citasHoy, citasPorEspecialidad } =
        statsResponse.data;

      setTotalPacientes(totalPacientes);
      setStats({
        pendientes: citasHoy.pendientes,
        finalizadas: citasHoy.finalizadas,
        enAtencion: citasHoy.enAtencion,
        canceladas: citasHoy.canceladas,
      });
      setCitasPorEspecialidad(citasPorEspecialidad || []);

      const citasResponse = await api.get("/dashboard/citas", {
        params: { fecha_inicio: filtroFechaInicio, fecha_fin: filtroFechaFin },
      });
      setCitas(citasResponse.data);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCita = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar esta cita?")) return;
    try {
      await api.put(`/citas/${id}/cancelar`);
      setSuccess("Cita cancelada exitosamente");
      cargarDatos();
      setOpenDetalle(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cancelar la cita");
    }
  };

  const handleEditarCita = async () => {
    setError("");
    try {
      await api.put(`/citas/${citaEditar.id}`, {
        fecha: citaEditar.fecha,
        hora: citaEditar.hora,
        tipo_cita: citaEditar.tipo_cita,
        motivo_consulta: citaEditar.motivo_consulta,
      });
      setSuccess("Cita actualizada exitosamente");
      setOpenEditar(false);
      cargarDatos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al editar la cita");
    }
  };

  const handleGraficaClick = (tipo) => {
    setGraficaExpandida(tipo);
  };

  const handlePrint = async () => {
    const printWindow = window.open("", "_blank");

    const chartElements = document.querySelectorAll(".recharts-wrapper");
    const chartImages = [];

    for (let chart of chartElements) {
      try {
        const canvas = await html2canvas(chart, {
          backgroundColor: "#ffffff",
          scale: 1,
          width: 600,
          height: 300,
          windowWidth: 500,
          windowHeight: 300,
          useCORS: true,
          allowTaint: true,
        });
        chartImages.push(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Error al capturar gráfica:", err);
      }
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Dashboard - Centro de Salud San José</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #0f172a; margin-top: 30px; }
            h3 { color: #475569; margin-bottom: 10px; text-align: center; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
            .stat-card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
            .stat-value { font-size: 36px; font-weight: bold; color: #0f172a; }
            .stat-label { color: #64748b; font-size: 14px; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2563eb; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .header { margin-bottom: 30px; }
            .date { color: #64748b; font-size: 14px; }
            .chart-container { 
              margin: 30px auto; 
              page-break-inside: avoid; 
              text-align: center;
              width: 100%;
              max-width: 700px;
            }
            .chart-container img { 
              width: 100%; 
              max-width: 700px;
              height: auto; 
              border: 1px solid #e2e8f0; 
              border-radius: 8px;
              display: block;
              margin: 0 auto;
            }
            .filters { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            @media print { 
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .chart-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dashboard - Sistema de Gestión Médica</h1>
            <p class="date">Centro de Salud Comunitario San José - Aguascalientes</p>
            <p class="date">Generado: ${new Date().toLocaleString("es-MX")}</p>
            <div class="filters">
              <strong>Período:</strong> ${new Date(filtroFechaInicio).toLocaleDateString("es-MX")} al ${new Date(filtroFechaFin).toLocaleDateString("es-MX")}
            </div>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value" style="color: #2563eb">${totalPacientes}</div>
              <div class="stat-label">Total Pacientes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #f59e0b">${stats.pendientes}</div>
              <div class="stat-label">Citas Pendientes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #3b82f6">${stats.enAtencion}</div>
              <div class="stat-label">En Atención</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #10b981">${stats.finalizadas}</div>
              <div class="stat-label">Finalizadas</div>
            </div>
          </div>

          <h2>Gráficas del Período</h2>
          ${
            chartImages.length >= 1
              ? `
            <div class="chart-container">
              <h3>Citas por Estado</h3>
              <img src="${chartImages[0]}" alt="Gráfica por Estado" />
            </div>
          `
              : ""
          }
          ${
            chartImages.length >= 2
              ? `
            <div class="chart-container">
              <h3>Distribución Porcentual</h3>
              <img src="${chartImages[1]}" alt="Distribución Porcentual" />
            </div>
          `
              : ""
          }
          ${
            chartImages.length >= 3
              ? `
            <div class="chart-container">
              <h3>Citas por Especialidad</h3>
              <img src="${chartImages[2]}" alt="Citas por Especialidad" />
            </div>
          `
              : ""
          }
          ${
            chartImages.length === 0
              ? `
            <p style="text-align: center; color: #64748b;">Nota: Las gráficas se muestran en la versión digital</p>
          `
              : ""
          }

          <h2>Citas por Especialidad</h2>
          <table>
            <thead>
              <tr><th>Especialidad</th><th>Cantidad</th></tr>
            </thead>
            <tbody>
              ${citasPorEspecialidad
                .map(
                  (e) => `
                <tr><td>${e.especialidad}</td><td>${e.cantidad}</td></tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <h2>Citas Programadas</h2>
          <p class="date">Total: ${citas.length} citas</p>
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
                  <td>${cita.estado.toUpperCase()}</td>
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
    }, 500);
  };

  const handleVerDetalle = (cita) => {
    setCitaSeleccionada(cita);
    setOpenDetalle(true);
  };

  const handleAbrirEditar = (cita) => {
    setCitaEditar({
      id: cita.id,
      fecha: cita.fecha,
      hora: cita.hora,
      tipo_cita: cita.tipo_cita || "Consulta General",
      motivo_consulta: cita.motivo_consulta || "",
    });
    setOpenDetalle(false);
    setOpenEditar(true);
  };

  const barChartData = [
    { name: "Pendientes", value: stats.pendientes, fill: "#f59e0b" },
    { name: "En Atención", value: stats.enAtencion, fill: "#3b82f6" },
    { name: "Finalizadas", value: stats.finalizadas, fill: "#10b981" },
    { name: "Canceladas", value: stats.canceladas, fill: "#ef4444" },
  ];

  const pieChartData = [
    { name: "Pendientes", value: stats.pendientes },
    { name: "Finalizadas", value: stats.finalizadas },
    { name: "En Atención", value: stats.enAtencion },
  ];

  const especialidadColors = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];
  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

  const StatCard = ({ title, value, icon, bgcolor, color, subtitle }) => (
    <Card
      sx={{
        bgcolor: bgcolor,
        border: `2px solid ${color}`,
        borderRadius: 3,
        transition: "all 0.3s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: color,
                fontWeight: 700,
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.875rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                mb: 0.5,
                lineHeight: 1.1,
                fontSize: { xs: "2.5rem", md: "3rem" },
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 500, display: "block" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 70,
              height: 70,
              bgcolor: "white",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 36, color: color } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            width: "100%",
            pt: 12,
            pb: 8,
            px: { xs: 4, md: 6 },
            textAlign: "center",
          }}
        >
          <Typography>Cargando datos...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ width: "100%", pt: 12, pb: 8, px: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 6, mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  mb: 1,
                  fontSize: "2.5rem",
                }}
              >
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Centro de Salud Comunitario San José - Aguascalientes
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                type="date"
                size="small"
                label="Fecha Inicio"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
              <TextField
                type="date"
                size="small"
                label="Fecha Fin"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
              <Chip
                icon={<CalendarToday />}
                label={`${new Date(filtroFechaInicio).toLocaleDateString("es-MX")} - ${new Date(filtroFechaFin).toLocaleDateString("es-MX")}`}
                sx={{ bgcolor: "#f1f5f9", fontWeight: 600, px: 2, py: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
                sx={{ py: 1.5 }}
              >
                Imprimir
              </Button>
            </Box>
          </Box>
        </Box>

        {error && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "#fee2e2",
              color: "#dc2626",
              borderRadius: 2,
            }}
          >
            {error}
          </Paper>
        )}
        {success && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "#d1fae5",
              color: "#059669",
              borderRadius: 2,
            }}
          >
            {success}
          </Paper>
        )}

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Pacientes"
              value={totalPacientes}
              subtitle="Registrados en el sistema"
              icon={<People />}
              bgcolor="#dbeafe"
              color="#2563eb"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Citas Pendientes"
              value={stats.pendientes}
              subtitle="Por atender"
              icon={<AccessTime />}
              bgcolor="#fef3c7"
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="En Atención"
              value={stats.enAtencion}
              subtitle="Actualmente atendiendo"
              icon={<EventNote />}
              bgcolor="#dbeafe"
              color="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Finalizadas"
              value={stats.finalizadas}
              subtitle="Completadas"
              icon={<CheckCircle />}
              bgcolor="#d1fae5"
              color="#10b981"
            />
          </Grid>
        </Grid>

        {/* GRÁFICAS CLICABLES */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
                height: "100%",
                minHeight: 450,
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  transform: "scale(1.02)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => handleGraficaClick("estado")}
            >
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#0f172a" }}
                  >
                    Distribución Período por Estado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Distribución del período
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Click para expandir
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
                height: "100%",
                minHeight: 450,
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  transform: "scale(1.02)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => handleGraficaClick("porcentaje")}
            >
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#0f172a" }}
                  >
                    Distribución Porcentual por Estado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Por estado
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Click para expandir
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
                height: "100%",
                minHeight: 450,
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  transform: "scale(1.02)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => handleGraficaClick("especialidad")}
            >
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#0f172a" }}
                  >
                    Citas por Especialidad
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Citas por tipo de especialidad
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Click para expandir
                </Typography>
              </Box>
              {citasPorEspecialidad.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 360,
                  }}
                >
                  <Typography color="text.secondary">
                    Sin datos en el período
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={citasPorEspecialidad} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis
                      type="category"
                      dataKey="especialidad"
                      stroke="#64748b"
                      fontSize={10}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="cantidad" radius={[0, 8, 8, 0]} barSize={20}>
                      {citasPorEspecialidad.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            especialidadColors[
                              index % especialidadColors.length
                            ]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* CITAS PROGRAMADAS */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: "#2563eb",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarToday sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#0f172a" }}
              >
                Citas Programadas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {citas.length} {citas.length === 1 ? "cita" : "citas"} en el
                período
              </Typography>
            </Box>
          </Box>

          {citas.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#f1f5f9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <EventNote sx={{ fontSize: 40, color: "#94a3b8" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, color: "#0f172a" }}
              >
                No hay citas programadas
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={5}>
              {citas.map((cita) => (
                <Grid item xs={12} md={6} lg={4} key={cita.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      border: "2px solid #e2e8f0",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: "#2563eb",
                        boxShadow: "0 8px 16px rgba(37, 99, 235, 0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => handleVerDetalle(cita)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <AccessTime sx={{ fontSize: 16, color: "#64748b" }} />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#0f172a" }}
                          >
                            {cita.hora}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}
                        >
                          {cita.paciente_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(cita.fecha).toLocaleDateString("es-MX")}
                        </Typography>
                      </Box>
                      <Chip
                        label={cita.estado.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor:
                            cita.estado === "pendiente"
                              ? "#fef3c7"
                              : cita.estado === "finalizada"
                                ? "#d1fae5"
                                : cita.estado === "en_atencion"
                                  ? "#dbeafe"
                                  : "#fee2e2",
                          color:
                            cita.estado === "pendiente"
                              ? "#f59e0b"
                              : cita.estado === "finalizada"
                                ? "#10b981"
                                : cita.estado === "en_atencion"
                                  ? "#3b82f6"
                                  : "#ef4444",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          px: 1.5,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", mb: 0.5 }}
                    >
                      <strong style={{ color: "#0f172a" }}>Médico:</strong> Dr.{" "}
                      {cita.medico_nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      <strong style={{ color: "#0f172a" }}>
                        Especialidad:
                      </strong>{" "}
                      {cita.especialidad_medico}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#2563eb",
                      }}
                    >
                      <Visibility fontSize="small" />
                      <Typography variant="caption">
                        Click para ver detalles
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>

      {/* Dialog Detalle de Cita */}
      <Dialog
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "#2563eb",
            color: "white",
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <EventNote />
            <Typography variant="h6">Detalle de la Cita</Typography>
          </Box>
          <IconButton
            onClick={() => setOpenDetalle(false)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {citaSeleccionada && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Fecha y Hora
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#0f172a" }}
                >
                  {new Date(citaSeleccionada.fecha).toLocaleDateString(
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
                  variant="h5"
                  sx={{ fontWeight: 800, color: "#2563eb", mt: 1 }}
                >
                  {citaSeleccionada.hora} hrs
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, bgcolor: "#f0f9ff", borderRadius: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Paciente
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#0f172a" }}
                >
                  {citaSeleccionada.paciente_nombre}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Médico y Especialidad
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "#0f172a" }}
                >
                  Dr. {citaSeleccionada.medico_nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {citaSeleccionada.especialidad_medico}
                </Typography>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#faf5ff",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Tipo
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: "#0f172a", mt: 1 }}
                    >
                      {citaSeleccionada.tipo_cita || "Consulta General"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#fef3c7",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Estado
                    </Typography>
                    <br></br>
                    <Chip
                      label={citaSeleccionada.estado.toUpperCase()}
                      sx={{
                        mt: 1,
                        fontWeight: 700,
                        bgcolor: "#f59e0b",
                        color: "white",
                        px: 2,
                        py: 0.5,
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>

              {citaSeleccionada.motivo_consulta && (
                <Paper sx={{ p: 3, bgcolor: "#fff7ed", borderRadius: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Motivo de Consulta
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#0f172a", lineHeight: 1.6 }}
                  >
                    {citaSeleccionada.motivo_consulta}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0", gap: 1 }}>
          <Button
            onClick={() => setOpenDetalle(false)}
            sx={{ color: "#64748b" }}
          >
            Cerrar
          </Button>
          <Button
            onClick={() => handleAbrirEditar(citaSeleccionada)}
            startIcon={<Edit />}
            variant="outlined"
            sx={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            Editar
          </Button>
          <Button
            onClick={() => handleCancelarCita(citaSeleccionada.id)}
            startIcon={<Cancel />}
            variant="contained"
            color="error"
          >
            Cancelar Cita
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
          sx={{
            bgcolor: "#2563eb",
            color: "white",
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Edit />
            <Typography variant="h6">Editar Cita</Typography>
          </Box>
          <IconButton
            onClick={() => setOpenEditar(false)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
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
                    setCitaEditar({ ...citaEditar, tipo_cita: e.target.value })
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
            onClick={handleEditarCita}
            variant="contained"
            startIcon={<Edit />}
            sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Gráfica Expandida */}
      <Dialog
        open={graficaExpandida !== null}
        onClose={() => setGraficaExpandida(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { minHeight: "80vh" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#2563eb",
            color: "white",
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">
            {graficaExpandida === "estado" && "Citas por Estado"}
            {graficaExpandida === "porcentaje" && "Distribución Porcentual"}
            {graficaExpandida === "especialidad" && "Citas por Especialidad"}
          </Typography>
          <IconButton
            onClick={() => setGraficaExpandida(null)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {graficaExpandida === "estado" && (
            <ResponsiveContainer width="100%" height={600}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={14} />
                <YAxis stroke="#64748b" fontSize={14} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {graficaExpandida === "porcentaje" && (
            <ResponsiveContainer width="100%" height={600}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={200}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          {graficaExpandida === "especialidad" &&
            citasPorEspecialidad.length > 0 && (
              <ResponsiveContainer width="100%" height={600}>
                <BarChart data={citasPorEspecialidad} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={14} />
                  <YAxis
                    type="category"
                    dataKey="especialidad"
                    stroke="#64748b"
                    fontSize={14}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                  <Bar dataKey="cantidad" radius={[0, 8, 8, 0]} barSize={30}>
                    {citasPorEspecialidad.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          especialidadColors[index % especialidadColors.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          {graficaExpandida === "especialidad" &&
            citasPorEspecialidad.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 600,
                }}
              >
                <Typography color="text.secondary" variant="h6">
                  Sin datos en el período seleccionado
                </Typography>
              </Box>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;

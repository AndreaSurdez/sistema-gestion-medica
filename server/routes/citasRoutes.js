const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const { verificar } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.post('/', verificar, citasController.crearCita);
router.get('/', verificar, citasController.listarAgenda);
router.put('/:id/cancelar', verificar, citasController.cancelarCita);
router.put('/:id/estado', verificar, citasController.actualizarEstadoCita);
router.put('/:id', verificar, citasController.editarCita);

module.exports = router;
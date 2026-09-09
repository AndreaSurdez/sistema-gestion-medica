const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { verificar } = require('../middlewares/authMiddleware');

router.get('/', verificar, perfilController.obtenerPerfil);
router.put('/', verificar, perfilController.actualizarPerfil);
router.put('/password', verificar, perfilController.cambiarPassword);
router.get('/citas', verificar, perfilController.obtenerCitasPaciente);
router.get('/historial', verificar, perfilController.obtenerHistorialPaciente);

module.exports = router;
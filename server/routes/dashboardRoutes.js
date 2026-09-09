const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificar } = require('../middlewares/authMiddleware');

router.get('/estadisticas', verificar, dashboardController.obtenerEstadisticas);
router.get('/citas', verificar, dashboardController.obtenerCitasDashboard);

module.exports = router;
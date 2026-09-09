const express = require('express');
const router = express.Router();
const estadosController = require('../controllers/estadosController');
const { verificar } = require('../middlewares/authMiddleware');

router.post('/actualizar', verificar, estadosController.actualizarEstadosAutomaticos);

module.exports = router;
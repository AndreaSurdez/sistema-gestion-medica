const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');
const { verificar } = require('../middlewares/authMiddleware');

// Cualquier usuario autenticado puede ver pacientes (para crear citas)
router.get('/', verificar, pacientesController.listar);
router.post('/', verificar, /* esAdmin, */ pacientesController.registrar);
router.get('/:id', verificar, pacientesController.buscar);
router.put('/:id', verificar, /* esAdmin, */ pacientesController.actualizar);
router.delete('/:id', verificar, /* esAdmin, */ pacientesController.eliminar);

module.exports = router;
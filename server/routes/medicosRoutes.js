const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');
const { verificar, esAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificar, medicosController.listarMedicos);
router.post('/', verificar, esAdmin, medicosController.crearMedico);
router.delete('/:id', verificar, esAdmin, medicosController.eliminarMedico);

module.exports = router;
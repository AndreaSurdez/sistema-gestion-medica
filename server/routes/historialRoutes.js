const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { verificar, esMedico } = require('../middlewares/authMiddleware');

// Consultar historial (cualquier usuario autenticado puede ver el de su paciente)
router.get('/paciente/:paciente_id', 
  verificar, 
  historialController.consultarHistorial
);

// Registrar entrada (solo médicos pueden hacerlo)
router.post('/', 
  verificar, 
  esMedico,
  historialController.registrarEntrada
);

module.exports = router;
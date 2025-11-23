const express = require('express');
const { body, param, query } = require('express-validator');
const productoController = require('../controllers/productoController');
const { validarJWT, tieneRol } = require('../middleware/authMiddleware');

const router = express.Router();

// Validaciones
const validacionesCrearProducto = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),
  body('categoria_id')
    .isInt({ min: 1 }).withMessage('La categoría es requerida'),
  body('precio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('stock_minimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero positivo')
];

const validacionesActualizarProducto = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('nombre')
    .optional()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),
  body('precio')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
];

// Rutas
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('categoria').optional().isInt({ min: 1 }),
    query('stock_bajo').optional().isIn(['true', 'false'])
  ],
  productoController.obtenerProductos
);

router.get('/stock/bajo',
  validarJWT,
  productoController.obtenerStockBajo
);

router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de producto inválido')
  ],
  productoController.obtenerProducto
);

router.post('/',
  validarJWT,
  tieneRol(['admin']),
  validacionesCrearProducto,
  productoController.crearProducto
);

router.put('/:id',
  validarJWT,
  tieneRol(['admin']),
  validacionesActualizarProducto,
  productoController.actualizarProducto
);

module.exports = router;

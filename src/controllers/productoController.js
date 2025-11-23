const { Producto, Categoria } = require('../models');
const { validationResult } = require('express-validator');

const productoController = {
  
  // Obtener todos los productos
  async obtenerProductos(req, res, next) {
    try {
      const { categoria, stock_bajo, page = 1, limit = 10 } = req.query;
      
      const whereConditions = { activo: true };
      
      if (categoria) {
        whereConditions.categoria_id = categoria;
      }
      
      if (stock_bajo === 'true') {
        const { sequelize } = require('../config/database');
        whereConditions.stock_actual = {
          [sequelize.Op.lte]: sequelize.col('stock_minimo')
        };
      }
      
      const offset = (page - 1) * limit;
      
      const productos = await Producto.findAndCountAll({
        where: whereConditions,
        include: [{
          model: Categoria,
          attributes: ['id', 'nombre']
        }],
        limit: parseInt(limit),
        offset: offset,
        order: [['nombre', 'ASC']]
      });
      
      res.json({
        success: true,
        data: productos.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: productos.count,
          pages: Math.ceil(productos.count / limit)
        }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Obtener producto por ID
  async obtenerProducto(req, res, next) {
    try {
      const { id } = req.params;
      
      const producto = await Producto.findByPk(id, {
        include: [{
          model: Categoria,
          attributes: ['id', 'nombre']
        }]
      });
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: producto
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Crear nuevo producto
  async crearProducto(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const { nombre, descripcion, categoria_id, precio, stock_minimo } = req.body;
      
      // Verificar que la categoría existe
      const categoria = await Categoria.findByPk(categoria_id);
      if (!categoria) {
        return res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe'
        });
      }
      
      const producto = await Producto.create({
        nombre,
        descripcion,
        categoria_id,
        precio: parseFloat(precio),
        stock_minimo: stock_minimo || 5
      });
      
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: producto
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Actualizar producto
  async actualizarProducto(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      const { nombre, descripcion, categoria_id, precio, stock_minimo, activo } = req.body;
      
      const producto = await Producto.findByPk(id);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }
      
      // Verificar categoría si se está actualizando
      if (categoria_id) {
        const categoria = await Categoria.findByPk(categoria_id);
        if (!categoria) {
          return res.status(400).json({
            success: false,
            message: 'La categoría especificada no existe'
          });
        }
      }
      
      await producto.update({
        nombre: nombre || producto.nombre,
        descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
        categoria_id: categoria_id || producto.categoria_id,
        precio: precio !== undefined ? parseFloat(precio) : producto.precio,
        stock_minimo: stock_minimo !== undefined ? stock_minimo : producto.stock_minimo,
        activo: activo !== undefined ? activo : producto.activo
      });
      
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: producto
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Obtener productos con stock bajo
  async obtenerStockBajo(req, res, next) {
    try {
      const productos = await Producto.findAll({
        where: {
          activo: true,
          stock_actual: {
            [require('sequelize').Op.lte]: require('sequelize').col('stock_minimo')
          }
        },
        include: [{
          model: Categoria,
          attributes: ['id', 'nombre']
        }],
        order: [
          ['stock_actual', 'ASC'],
          ['nombre', 'ASC']
        ]
      });
      
      const productosConDiferencia = productos.map(producto => ({
        ...producto.toJSON(),
        diferencia: producto.stock_actual - producto.stock_minimo
      }));
      
      res.json({
        success: true,
        data: productosConDiferencia,
        total: productos.length
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productoController;

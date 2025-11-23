const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del producto es requerido'
      },
      len: {
        args: [1, 200],
        msg: 'El nombre debe tener entre 1 y 200 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El precio debe ser mayor o igual a 0'
      }
    }
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'El stock no puede ser negativo'
      }
    }
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: {
        args: [0],
        msg: 'El stock mínimo no puede ser negativo'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'productos',
  timestamps: true,
  underscored: true
});

// Métodos de instancia
Producto.prototype.tieneStockSuficiente = function(cantidad) {
  return this.stock_actual >= cantidad;
};

Producto.prototype.actualizarStock = async function(cantidad, tipo) {
  if (tipo === 'entrada') {
    this.stock_actual += cantidad;
  } else if (tipo === 'salida') {
    if (!this.tieneStockSuficiente(cantidad)) {
      throw new Error(`Stock insuficiente para ${this.nombre}. Disponible: ${this.stock_actual}, Solicitado: ${cantidad}`);
    }
    this.stock_actual -= cantidad;
  }
  return await this.save();
};

module.exports = Producto;

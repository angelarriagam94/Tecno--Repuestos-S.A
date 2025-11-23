'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      stock_actual: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      stock_minimo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_actualizacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices para mejorar performance
    await queryInterface.addIndex('productos', ['categoria_id']);
    await queryInterface.addIndex('productos', ['activo']);
    await queryInterface.addIndex('productos', ['stock_actual']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
  }
};

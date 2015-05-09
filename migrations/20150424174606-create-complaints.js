'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('complaints', { 
      id                 : {
                            type:Sequelize.INTEGER,
                            primaryKey: true,
                            autoIncrement: true
                           },
      updatedAt          : Sequelize.DATE,
      createdAt          : Sequelize.DATE,

      bin                : Sequelize.STRING,
      complaint_num      : Sequelize.STRING,
      regarding          : Sequelize.STRING,
      category           : Sequelize.STRING,
      assigned_to        : Sequelize.STRING,
      priority           : Sequelize.STRING,
      received           : Sequelize.STRING,
      block              : Sequelize.STRING,
      lot                : Sequelize.STRING,
      community_board    : Sequelize.STRING,
      owner              : Sequelize.STRING,
      last_inspection    : Sequelize.STRING,
      disposition        : Sequelize.STRING,
      dob_violation_num  : Sequelize.STRING,
      ecb_violation_num  : Sequelize.STRING,
      comments           : Sequelize.STRING,



    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('complaints');

  }
};
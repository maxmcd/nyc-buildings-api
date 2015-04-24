'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('ecb_violations', { 
      id                              : {
                                          type:Sequelize.INTEGER,
                                          primaryKey: true,
                                          autoIncrement: true
                                        },
      updatedAt                       : Sequelize.DATE,
      createdAt                       : Sequelize.DATE,

      bin                             : Sequelize.STRING,
      violation_number                : Sequelize.STRING,
      dob_violation_number            : Sequelize.STRING,
      violation_status                : Sequelize.STRING,
      severity                        : Sequelize.STRING,
      certification_status            : Sequelize.STRING,
      hearing_status                  : Sequelize.STRING,
      penalty_balance_due             : Sequelize.STRING,
      respondent_name                 : Sequelize.STRING,
      respondent_mailing_address      : Sequelize.STRING,
      violation_date                  : Sequelize.STRING,
      violation_type                  : Sequelize.STRING,
      violation_served_date           : Sequelize.STRING,
      violation_inspection_unit       : Sequelize.STRING,
      infraction_codes                : Sequelize.STRING,
      section_of_law                  : Sequelize.STRING,
      standard_description            : Sequelize.STRING,
      specifics_and_remedy            : Sequelize.STRING,
      issuing_inspector_id            : Sequelize.STRING,
      issued_as_aggravated_level      : Sequelize.STRING,
      compliance_certification_status : Sequelize.STRING,
      compliance_on                   : Sequelize.STRING,
      scheduled_hearing_date          : Sequelize.STRING,
      scheduled_hearing_status        : Sequelize.STRING,
      scheduled_hearing_time          : Sequelize.STRING,
      penalty_imposed                 : Sequelize.STRING,
      penalty_adjustments             : Sequelize.STRING,
      penalty_amount_paid             : Sequelize.STRING,
      penalty_balance_due             : Sequelize.STRING,
      penalty_court_docket_date       : Sequelize.STRING,

    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('ecb_violations');

  }
};
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        user_name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        display_name: {
          type: Sequelize.STRING
        },
        score: {
          type: Sequelize.INTEGER                     
        },
        password: {
          type: Sequelize.INTEGER
        }
    });
    return User;
};
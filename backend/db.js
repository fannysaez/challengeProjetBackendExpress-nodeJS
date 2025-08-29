const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'mydb'
};

let connection;

async function connectToMySQL() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connecté à la base de données MySQL');
    return connection;
  } catch (error) {
    console.error('Erreur de connexion à MySQL:', error);
    throw error;
  }
}

function getConnection() {
  return connection;
}

module.exports = { connectToMySQL, getConnection };
const mysql = require('mysql2');
require('dotenv').config();

// Crear el pool de conexiones. Es mejor que una sola conexión para manejar múltiples peticiones concurrentes.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Probar la conexión inicial
promisePool.getConnection()
    .then(connection => {
        console.log('Conexión a la base de datos MySQL establecida con éxito.');
        connection.release();
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err);
    });

module.exports = promisePool;

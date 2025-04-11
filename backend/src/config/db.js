const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config();

// Verificar que DATABASE_URL está definida
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL no está definida en .env");
  process.exit(1);
}

// Configurar Sequelize con opciones adicionales
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : false,
  },
  logging: false, // Desactiva logs de consultas
  pool: {
    max: 5, // Número máximo de conexiones simultáneas
    min: 0, // Número mínimo de conexiones
    acquire: 30000, // Tiempo máximo para obtener conexión (30s)
    idle: 10000, // Tiempo máximo inactivo antes de liberar conexión
  },
  retry: {
    max: 3, // Reintentar conexión hasta 3 veces
  },
});

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a PostgreSQL");
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:", error.message);
    return false;
  }
};

// Manejo de cierre de conexión cuando la aplicación se detiene
const closeDB = async () => {
  try {
    console.log("🛑 Cerrando conexión con la base de datos...");
    await sequelize.close();
    console.log("✅ Conexión cerrada correctamente.");
  } catch (error) {
    console.error("⚠️ Error al cerrar la conexión:", error.message);
  }
};

// Manejar SIGINT y SIGTERM para cerrar la conexión antes de salir
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { sequelize, connectDB, closeDB };

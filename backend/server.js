const express = require("express");
require("dotenv").config(); // Cargar variables de entorno
const http = require("http");
const { Server } = require("socket.io");
const { connectDB, sequelize } = require("./src/config/db"); // Asegurar conexión correcta
const app = require("./src/app"); // Asegurar que app.js está bien configurado

// Configurar puerto desde .env o por defecto en 5000
const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar WebSockets con seguridad en CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", // Definir el cliente permitido desde .env
    methods: ["GET", "POST"],
  },
});

// Manejo de conexiones WebSockets
io.on("connection", (socket) => {
  console.log(`🟢 Usuario conectado: ${socket.id}`);

  // Evento para recibir y reenviar notificaciones
  socket.on("sendNotification", (data) => {
    if (data) {
      console.log("📩 Notificación recibida:", data);
      io.emit("receiveNotification", data);
    }
  });

  // Evento cuando un usuario se desconecta
  socket.on("disconnect", () => {
    console.log(`🔴 Usuario desconectado: ${socket.id}`);
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    await connectDB(); // Conectar a la base de datos antes de iniciar el servidor
    server.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
    process.exit(1); // Si falla la DB, no se inicia el servidor
  }
};

// Cierre limpio cuando se detiene la aplicación
const gracefulShutdown = async () => {
  console.log("\n🛑 Cerrando servidor...");
  await sequelize.close();
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente.");
    process.exit(0);
  });
};

// Capturar señales del sistema para apagar el servidor correctamente
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Iniciar el servidor
startServer();

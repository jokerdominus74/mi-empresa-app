const admin = require("firebase-admin");

// Verifica que todas las variables de entorno están definidas
const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`⚠️ Error: La variable de entorno ${envVar} no está definida.`);
    process.exit(1);
  }
}

// Configura Firebase Admin usando variables de entorno
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin inicializado correctamente.");
} catch (error) {
  console.error("❌ Error al inicializar Firebase Admin:", error.message);
  process.exit(1);
}

module.exports = admin;

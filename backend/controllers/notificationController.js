const admin = require("../config/firebase");

exports.sendPushNotification = async (req, res) => {
  try {
    const { title, body, token } = req.body;

    const message = {
      notification: { title, body },
      token,
    };

    await admin.messaging().send(message);
    res.json({ message: "Notificación enviada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

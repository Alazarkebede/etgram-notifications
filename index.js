const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post("/send-notification", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await admin.messaging().send({
      notification: { title, body },
      data: data || {},
      token,
    });
    res.json({ success: true });
  } catch (error) {
    console.error("FCM error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

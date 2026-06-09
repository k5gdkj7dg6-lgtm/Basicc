require("dotenv").config();
const express = require("express");
const twilio = require("twilio");

const app = express();
app.use(express.json());

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Route your frontend calls
app.post("/api/track", async (req, res) => {
  const data = req.body;

  // Format the message
  const messageText = `
📍 Location Update
Latitude: ${data.latitude}
Longitude: ${data.longitude}
Accuracy: ${data.accuracy}m
Speed: ${data.speed}
Heading: ${data.heading}
Altitude: ${data.altitude}

UTM Zone: ${data.utm.zone}
Easting: ${data.utm.easting}
Northing: ${data.utm.northing}

Timestamp: ${new Date(data.timestamp).toLocaleString()}
  `;

  try {
    await client.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER   // <-- your number goes in .env
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Twilio error:", err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

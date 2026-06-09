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

// Only send the first time the website loads
let hasSentFirstLocation = false;

app.post("/api/track", async (req, res) => {
  const data = req.body;

  // Format the message
  const messageText = `
📍 Location Update (Website Opened)
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
    // Only send ONCE when the website first loads
    if (!hasSentFirstLocation) {
      await client.messages.create({
        body: messageText,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.MY_PHONE_NUMBER
      });

      hasSentFirstLocation = true;
      console.log("Sent first location to your phone.");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Twilio error:", err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Only send once when website opens
let hasSentFirstLocation = false;

// Reverse geocode function
async function getAddress(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "LocationApp/1.0" }
  });
  const data = await res.json();
  return data.display_name || "Address unavailable";
}

app.post("/api/track", async (req, res) => {
  const data = req.body;

  try {
    // Get street address
    const address = await getAddress(data.latitude, data.longitude);

    // Google Maps link
    const mapsLink = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

    // Build message
    const messageText = `
📍 Location Update (Website Opened)

Address:
${address}

Google Maps:
${mapsLink}

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

    // Only send once
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
    console.error("Error:", err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

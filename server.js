const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// REWRITTEN: Brutally short instructions to force speed and brevity
const SAFETY_INSTRUCTIONS = `You are a 20-word Emergency AI. STRICT RULE: Maximum 2 sentences. No greetings. Directly list actions. Example: "1. Park safely. 2. Loosen nuts. 3. Jack up and swap tire. Safe now?"`;

// CONFIGURATION: Set the only allowed credentials
const AUTHORIZED_EMAIL = "prenishaa.a.csd.2023@snsce.ac.in";
const AUTHORIZED_PASS = "admin123"; // Make sure to type this exactly in the login box

// LOGIN ENDPOINT (Strict Validation)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // Check if the input exactly matches the authorized credentials
    if (email.trim().toLowerCase() === AUTHORIZED_EMAIL && password === AUTHORIZED_PASS) {
        res.json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid email or password!" });
    }
});

// SOS ALERT ENDPOINT
app.post('/api/sos', async (req, res) => {
    const { userName, location } = req.body;
    const targetMobile = "9361845917"; 
    const message = `EMERGENCY ALERT! Tourist ${userName} triggered SOS at ${location}. Please send help.`;
    const API_KEY = "YOUR_FAST2SMS_API_KEY"; // Replace with your real key

    try {
        const smsResponse = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&route=q&message=${encodeURIComponent(message)}&flash=0&numbers=${targetMobile}`);
        const smsData = await smsResponse.json();
        res.json({ success: smsData.return, reply: smsData.return ? "SOS alert delivered to 9361845917." : "SMS Gateway Error." });
    } catch (error) {
        res.status(500).json({ success: false, reply: "Failed to connect to SMS service." });
    }
});

// AI CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
    const { message, location } = req.body;
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                system: SAFETY_INSTRUCTIONS,
                prompt: `LOC: ${location}\nMSG: ${message}`,
                stream: false,
                options: { num_predict: 30, temperature: 0.1, top_p: 0.1, stop: ["\n", "."] }
            })
        });
        const data = await response.json();
        res.json({ reply: data.response });
    } catch (error) {
        res.status(500).json({ reply: "System Error. Call 108 immediately." });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
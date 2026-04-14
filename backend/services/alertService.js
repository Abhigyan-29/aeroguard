const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { fetchEvents } = require('./nasaService');

// In a real production app, you would use actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'your_ethereal_password'
  }
});

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running Automated Alert Service Chron Job...');
  try {
    const data = await fetchEvents('open', 1); // Get recent events from last 24h
    if (!data.events || data.events.length === 0) return;

    // Fetch all users who have subscribed to alerts
    const users = await User.find({ 'alertRegions.0': { $exists: true } });
    if (users.length === 0) return;

    // Logic: if an event is near a user's region, we "send" an alert
    for (const user of users) {
      for (const region of user.alertRegions) {
        // Very rough bounding box logic for simulation
        const relevantEvents = data.events.filter(e => {
          if (!e.geometry || e.geometry.length === 0) return false;
          const [lng, lat] = e.geometry[0].coordinates;
          const dist = Math.sqrt(Math.pow(lat - region.lat, 2) + Math.pow(lng - region.lng, 2));
          return dist < 5; // roughly 500km radius depending on projection
        });

        if (relevantEvents.length > 0) {
          console.log(`✉️ Simulated NodeMailer: Sending HIGH ALERT EMAIL to ${user.email} regarding ${relevantEvents.length} events near ${region.country}`);
          // transporter.sendMail({ from: 'alerts@terrapulse.io', to: user.email, subject: "TerraPulse Alert", text: "..." })
        }
      }
    }
  } catch (error) {
    console.error('Alert Service Error:', error.message);
  }
});

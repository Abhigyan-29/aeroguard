const { fetchEvents } = require("../services/nasaService");

exports.getEvents = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 60;
    const status = req.query.status || "all";
    const data = await fetchEvents(status, days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};
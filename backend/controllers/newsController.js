const axios = require('axios');

exports.getNews = async (req, res) => {
  const { query } = req.query; // e.g., 'wildfire california'
  
  if (!query) {
    return res.status(400).json({ error: "Query parameter required" });
  }

  const NEWS_API_KEY = process.env.NEWS_API_KEY;

  if (!NEWS_API_KEY) {
    // Graceful FREE Mock Fallback if user hasn't provided a News API Key yet
    console.warn("No NEWS_API_KEY provided. Using rich mock data for presentation.");
    const mockArticles = [
      {
        title: `URGENT: Anomalous activity detected regarding ${query}`,
        description: `Local authorities and international organizations are currently monitoring the developing situation regarding ${query}. Evacuations and emergency protocols are on standby as the situation progresses.`,
        url: "https://news.google.com",
        publishedAt: new Date().toISOString(),
        source: { name: "Global Observer Core" }
      },
      {
        title: `Expert Analysis on ${query} trajectory`,
        description: `Meteorological surface scans indicate that the geological phenomenon categorized as ${query} is experiencing unprecedented telemetry shifts. Keep monitoring local broadcasts.`,
        url: "https://eonet.gsfc.nasa.gov/",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "TerraPulse Intelligence" }
      }
    ];
    return res.json({ articles: mockArticles });
  }

  try {
    const q = encodeURIComponent(query);
    const response = await axios.get(`https://gnews.io/api/v4/search?q=${q}&lang=en&max=3&sortby=publishedAt&apikey=${NEWS_API_KEY}`);
    res.json({ articles: response.data.articles });
  } catch (error) {
    console.error("News API Error:", error.message);
    res.status(500).json({ error: "News API unavailable" });
  }
};

const axios = require("axios");

exports.fetchEvents = async (status = "all", days = 60) => {
  try {
    const response = await axios.get(
      `https://eonet.gsfc.nasa.gov/api/v3/events?status=${status}&days=${days}`
    );

    if (!response.data || !response.data.events) {
      throw new Error("Invalid response from NASA API");
    }

    return response.data;
  } catch (error) {
    console.error("NASA API Error:", error.message);
    throw error;
  }
};
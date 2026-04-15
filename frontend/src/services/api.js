import axios from "axios";

const API = axios.create({
  baseURL: "https://aeroguard-backend-y4rh.onrender.com/"
});

// Attach JWT token to requests if available
API.interceptors.request.use((req) => {
  if (localStorage.getItem('terrapulse_token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('terrapulse_token')}`;
  }
  return req;
});

export const getEvents = async (days = 60) => {
  const res = await API.get(`/events?days=${days}`);
  return res.data;
};

export const getNews = async (query) => {
  const res = await API.get(`/news?query=${encodeURIComponent(query)}`);
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (email, password) => {
  const res = await API.post("/auth/register", { email, password });
  return res.data;
};

export const toggleWatchlist = async (event) => {
  const res = await API.post("/auth/watchlist", { event });
  return res.data; // returns updated watchlist array
};

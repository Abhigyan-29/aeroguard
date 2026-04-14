const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'terrapulse_super_secret_key_2026';

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, watchlist: user.watchlist, alertRegions: user.alertRegions } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, watchlist: user.watchlist, alertRegions: user.alertRegions } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateWatchlist = async (req, res) => {
  try {
    const { event } = req.body; // Full event object
    const user = await User.findById(req.user.id);
    
    const exists = user.watchlist.find(i => i.eventId === event.id);
    if (exists) {
      user.watchlist = user.watchlist.filter(i => i.eventId !== event.id);
    } else {
      user.watchlist.push({
        eventId: event.id,
        title: event.title,
        date: event.geometry[0]?.date || new Date(),
        category: event.categories[0]?.title || 'Unknown'
      });
    }
    
    await user.save();
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

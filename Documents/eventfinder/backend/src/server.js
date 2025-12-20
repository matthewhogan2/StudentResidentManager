require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const eventRoutes = require('./routes/eventRoutes');
const cors = require('cors'); 
const app = express();


// Middleware
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));


app.use(express.json());
app.use(cookieParser());

// Serve frontend static assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.use('/frontend', express.static(frontendPath)); // allow /frontend/... paths

// Routes
app.use('/auth', authRoutes);

// Event routes
app.use('/events', eventRoutes);

// Static folder for uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));


// Test route
app.get('/', (req, res) => {
  res.json({ message: 'EventFinder API is running' });
});

// Protected route 
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

// Connect to DB and start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

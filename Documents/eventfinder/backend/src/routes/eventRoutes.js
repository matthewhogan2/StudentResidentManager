const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const {
  getEvents,
  searchEvents,
  getSavedEvents,
  saveEvent,
  removeSavedEvent,
  createEvent,
  deleteEvent
} = require('../controllers/eventController');


// Public routes
router.get('/', getEvents);
router.get('/search', searchEvents);


// Protectected routes (must be logged in)
router.get('/saved', auth, getSavedEvents);
router.post('/save', auth, saveEvent);
router.delete('/remove/:eventId', auth, removeSavedEvent);


// create event (must be logged in)
router.post('/create', auth, upload.single("image"), createEvent);

// delete an event (owner only)
router.delete('/:id', auth, deleteEvent);

module.exports = router;

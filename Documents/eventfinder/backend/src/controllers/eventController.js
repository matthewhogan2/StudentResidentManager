const Event = require('../models/Event');
const User = require('../models/User');


// Get all events (public)
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Save event to user's savedEvents
exports.saveEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const alreadySaved = req.user.savedEvents.some(id => id.toString() === eventId.toString());
    if (!alreadySaved) {
      req.user.savedEvents.push(event._id);
      await req.user.save();
      await Event.findByIdAndUpdate(eventId, { $inc: { saveCount: 1 } });
    }

    res.json({ message: 'Event saved', savedEvents: req.user.savedEvents });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Remove saved event
exports.removeSavedEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const wasSaved = req.user.savedEvents.some(id => id.toString() === eventId);
    req.user.savedEvents = req.user.savedEvents.filter(id => id.toString() !== eventId);
    await req.user.save();

    if (wasSaved) {
      const event = await Event.findById(eventId);
      if (event) {
        event.saveCount = Math.max(0, (event.saveCount || 0) - 1);
        await event.save();
      }
    }

    res.json({ message: 'Event removed', savedEvents: req.user.savedEvents });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// List saved events
exports.getSavedEvents = async (req, res) => {
  try {
    const userWithEvents = await User.findById(req.user._id)
      .populate({
        path: 'savedEvents',
        populate: { path: 'createdBy', select: 'name email' }
      });

    res.json(userWithEvents.savedEvents);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Search events by keyword, category, date, or time window
exports.searchEvents = async (req, res) => {
  try {
    const { keyword, category, date, when } = req.query;

    let query = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (date) {
      query.date = date;
    } else if (when) {
      const now = new Date();
      const fmt = (d) => d.toISOString().slice(0, 10);

      const startOfWeek = (d) => {
        const clone = new Date(d);
        const day = clone.getDay(); // 0-6
        const diff = clone.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        clone.setDate(diff);
        return clone;
      };

      let start, end;
      switch (when) {
        case 'today':
          start = fmt(now);
          end = fmt(now);
          query.date = { $gte: start, $lte: end };
          break;
        case 'this-week': {
          const s = startOfWeek(now);
          const e = new Date(s);
          e.setDate(e.getDate() + 6);
          query.date = { $gte: fmt(s), $lte: fmt(e) };
          break;
        }
        case 'next-week': {
          const s = startOfWeek(now);
          s.setDate(s.getDate() + 7);
          const e = new Date(s);
          e.setDate(e.getDate() + 6);
          query.date = { $gte: fmt(s), $lte: fmt(e) };
          break;
        }
        default:
          break;
      }
    }

    const results = await Event.find(query).populate('createdBy', 'name email');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new event (HOST USER)
exports.createEvent = async (req, res) => {
  try {
    const { title, category, date, time, location, description } = req.body;

    if (!title || !category || !date || !time || !location || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newEvent = await Event.create({
      title,
      category,
      date,
      time,
      location,
      description,
      image,
      createdBy: req.user._id
    });

    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating event" });
  }
};

// Delete an event (owner only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.createdBy) {
      return res.status(400).json({ message: "Event has no owner set" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to delete this event" });
    }

    await Event.findByIdAndDelete(id);
    await User.updateMany(
      { savedEvents: id },
      { $pull: { savedEvents: id } }
    );

    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting event" });
  }
};

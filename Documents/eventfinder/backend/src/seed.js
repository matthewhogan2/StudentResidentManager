require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected to MongoDB. Seeding events...");

  // Ensure a host user exists for ownership
  let hostUser = await User.findOne({ email: "host@example.com" });
  if (!hostUser) {
    const hashed = await bcrypt.hash("password123", 10);
    hostUser = await User.create({
      name: "Host User",
      email: "host@example.com",
      password: hashed
    });
    console.log("Created seed host user: host@example.com / password123");
  }

  // date helpers
  // use midday to avoid timezone rollbacks/forwards on UTC conversion
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const fmt = (d) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
  const daysFromNow = (n) => {
    const copy = new Date(today);
    copy.setDate(copy.getDate() + n);
    return fmt(copy);
  };
  const monthsFromNow = (n) => {
    const copy = new Date(today);
    copy.setMonth(copy.getMonth() + n);
    return fmt(copy);
  };

  // Sample events
  const events = [
    {
      title: "Local Jazz Night",
      category: "Music",
      date: daysFromNow(7), 
      location: "Dublin City Centre",
      description: "A relaxing night of live jazz at The Blue Note. All are welcome!",
      time: "19:30",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Tech Meetup",
      category: "Technology",
      date: monthsFromNow(1), 
      location: "Tu Dublin",
      description: "Networking event for software developers and tech enthusiasts.",
      time: "18:00",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Outdoor Yoga Session",
      category: "Fitness",
      date: daysFromNow(21), 
      location: "Phoenix Park",
      description: "Morning yoga session in nature. All skill levels welcome.",
      time: "08:00",
      image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Art Exhibition",
      category: "Art",
      date: monthsFromNow(2), 
      location: "National Gallery of Ireland",
      description: "Showcasing contemporary artists from across Ireland.",
      time: "17:00",
      image: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=2044&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

    },
    {
      title: "Stand-up Comedy Night",
      category: "Comedy",
      date: monthsFromNow(3), 
      location: "The Laughter Lounge",
      description: "An evening of laughs featuring up and coming comedians.",
      time: "21:00",
      image: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=800&q=80"

    }
  ];

  // Wipe existing events (optional)
  await Event.deleteMany({});
  console.log("Old events removed.");

  // Insert new events
  const eventsWithOwner = events.map(evt => ({
    ...evt,
    createdBy: hostUser._id
  }));

  await Event.insertMany(eventsWithOwner);
  console.log("New events added!");

  await mongoose.disconnect();
  console.log("Database connection closed.");
}

seed();

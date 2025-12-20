const API_BASE = "http://localhost:3000";
let currentUser = null;
let currentWhen = "";

// Helpers

function formatRelativeDate(dateStr) {
  const target = new Date(dateStr);
  if (isNaN(target)) return dateStr;

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((target.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / msPerDay);

  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 14) return "In 1 week";
  if (diffDays < 21) return "In 2 weeks";
  if (diffDays < 28) return "In 3 weeks";

  const weeks = Math.round(diffDays / 7);
  if (weeks < 8) return `In ${weeks} weeks`;

  const months = Math.round(diffDays / 30);
  return `In ${months} month${months === 1 ? "" : "s"}`;
}

function getCountdown(dateStr) {
  const now = new Date();
  const eventDate = new Date(dateStr);
  const diff = eventDate - now;

  if (diff < 0) return "Event finished";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Event today!";
  if (days === 1) return "Starts in 1 day";

  return `Starts in ${days} days`;
}

function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path; // external URL (Unsplash etc.)
  return `${API_BASE}${path}`; // uploaded image from /uploads
}

function getCurrentUserId() {
  return currentUser?._id || currentUser?.id;
}

function isEventOwner(event) {
  const ownerId = event?.createdBy?._id || event?.createdBy?.id || event?.createdBy;
  const userId = getCurrentUserId();
  return ownerId && userId && ownerId.toString() === userId.toString();
}


async function checkAuthState() {
  const guestLinks = document.querySelectorAll(".auth-guest");
  const userLinks  = document.querySelectorAll(".auth-user");

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include"
    });

    if (res.status === 200) {
      const data = await res.json().catch(() => ({}));
      currentUser = data.user || null;
      guestLinks.forEach(el => el.style.display = "none");
      userLinks.forEach(el => el.style.display  = "block");
    } else {
      currentUser = null;
      guestLinks.forEach(el => el.style.display = "block");
      userLinks.forEach(el => el.style.display  = "none");
    }
  } catch (err) {
    currentUser = null;
    guestLinks.forEach(el => el.style.display = "block");
    userLinks.forEach(el => el.style.display  = "none");
  }
}


async function logoutUser() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch (e) {
      console.error(e);
  }
  // After logout, go to homepage; checkAuthState() will flip the nav
  window.location.href = "index.html";
}


//Event listing and search

async function loadAllEvents() {
  const container = document.getElementById("eventsContainer");
  if (!container) return; // not on homepage

  const res = await fetch(`${API_BASE}/events`);
  const events = await res.json();

  renderEventCards(events, container);
}

async function searchEvents() {
  const container = document.getElementById("eventsContainer");
  if (!container) return;

  const keyword = document.getElementById("searchInput")?.value || "";
  const category = document.getElementById("categoryFilter")?.value || "";

  let url = `${API_BASE}/events/search?`;
  if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
  if (category) url += `category=${encodeURIComponent(category)}&`;
  if (currentWhen) url += `when=${encodeURIComponent(currentWhen)}&`;

  const res = await fetch(url);
  const events = await res.json();

  renderEventCards(events, container);
}

function setWhenFilter(when) {
  currentWhen = when;
  const chips = document.querySelectorAll(".when-chip");
  chips.forEach(chip => {
    if (chip.dataset.when === when) chip.classList.add("active");
    else chip.classList.remove("active");
  });
  searchEvents();
}

function renderEventCards(events, container) {
  container.innerHTML = "";

  if (!events || events.length === 0) {
    container.innerHTML = `<p class="text-center mt-3">No events found.</p>`;
    return;
  }

  events.forEach(event => {
    container.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-save-badge">
            <span class="save-count"><span class="icon">★</span> ${event.saveCount || 0}</span>
          </div>
          <img src="${getImageUrl(event.image)}" class="card-img-top" alt="${event.title}" />
          <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text">${event.description}</p>
            <p class="event-meta"><strong>${formatRelativeDate(event.date)}</strong> • ${event.location}</p>
            <p class="text-primary"><strong>${getCountdown(event.date)}</strong></p>
            <button class="btn btn-success" onclick="saveEvent('${event._id}')">Save Event</button>
            ${isEventOwner(event) ? `<button class="btn btn-outline-danger ms-2" onclick="deleteOwnedEvent('${event._id}')">Delete</button>` : ""}
          </div>
        </div>
      </div>
    `;
  });
}


//Saved events
async function saveEvent(eventId) {
  const res = await fetch(`${API_BASE}/events/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ eventId })
  });

  if (res.status === 401) {
    alert("You must be logged in to save events.");
    window.location.href = "login.html";
    return;
  }

  const data = await res.json();
  alert(data.message || "Event saved");
}


async function loadSavedEvents() {
  const container = document.getElementById("savedEventsContainer");
  if (!container) return; // not on My Events page

  const res = await fetch(`${API_BASE}/events/saved`, {
    credentials: "include"
  });

  if (res.status === 401) {
    container.innerHTML = `
      <p class="text-center text-danger mt-3">
        You must be logged in to view saved events.
      </p>
    `;
    return;
  }

  const events = await res.json();

  if (!events || events.length === 0) {
    container.innerHTML = `<p class="text-center mt-3">No saved events yet.</p>`;
    return;
  }

  container.innerHTML = "";
  events.forEach(event => {
    const ownerDelete = isEventOwner(event)
      ? `<button class="btn btn-outline-danger ms-2" onclick="deleteOwnedEvent('${event._id}')">Delete Event</button>`
      : "";

    container.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-save-badge">
            <span class="save-count"><span class="icon">★</span> ${event.saveCount || 0}</span>
          </div>
          <img src="${getImageUrl(event.image)}" class="card-img-top" alt="${event.title}" />
          <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text">${event.description}</p>
            <p class="event-meta"><strong>${formatRelativeDate(event.date)}</strong> • ${event.location}</p>
            <p class="text-primary"><strong>${getCountdown(event.date)}</strong></p>
            <button class="btn btn-danger" onclick="removeSavedEvent('${event._id}')">Remove</button>
            ${ownerDelete}
          </div>
        </div>
      </div>
    `;
  });
}

async function removeSavedEvent(eventId) {
  const res = await fetch(`${API_BASE}/events/remove/${eventId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (res.status === 401) {
    alert("You must be logged in to remove saved events.");
    window.location.href = "login.html";
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    alert(data.message || "Unable to remove event");
    return;
  }

  alert(data.message || "Removed");

  loadSavedEvents();
}

async function deleteOwnedEvent(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (res.status === 401) {
    alert("You must be logged in to delete events.");
    window.location.href = "login.html";
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    alert(data.message || "Unable to delete event");
    return;
  }

  alert(data.message || "Event deleted");
  loadSavedEvents();
  loadAllEvents();
}

//authentication

async function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.status === 201) {
    window.location.href = "login.html";
  }
}

async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.status === 200) {
    window.location.href = "index.html";
  }
}

//Create Event host user

async function submitEvent(e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", document.getElementById("eventTitle").value);
  formData.append("category", document.getElementById("eventCategory").value);
  formData.append("date", document.getElementById("eventDate").value);
  formData.append("time", document.getElementById("eventTime").value);
  formData.append("location", document.getElementById("eventLocation").value);
  formData.append("description", document.getElementById("eventDescription").value);
  formData.append("image", document.getElementById("eventImage").files[0]);

  const res = await fetch(`${API_BASE}/events/create`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  if (res.status === 401) {
    alert("You must be logged in to create events.");
    window.location.href = "login.html";
    return;
  }

  const data = await res.json();
  alert(data.message);

  if (res.status === 201) {
    window.location.href = "index.html";
  }
}



//On page load 
window.addEventListener("load", async () => {
  await checkAuthState(); // toggle nav based on logged-in status and capture user
  await loadAllEvents(); // if on index.html, it will run
  await loadSavedEvents();  // if on my-events.html, it will run
});

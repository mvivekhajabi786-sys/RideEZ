/* =========================================
   RIDEEZ FINAL DEMO TRACKING SCRIPT
   Features:
   - Signup / Login
   - Book Ride
   - User Dashboard + Ride History
   - Driver Register
   - Driver Dashboard
   - Admin Dashboard
   - Driver Assign
   - Demo Live Tracking with Leaflet
========================================= */

/* =========================
   STORAGE HELPERS
========================= */
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getDrivers() {
    return JSON.parse(localStorage.getItem("drivers")) || [];
}
function saveDrivers(drivers) {
    localStorage.setItem("drivers", JSON.stringify(drivers));
}

function getRides() {
    return JSON.parse(localStorage.getItem("rides")) || [];
}
function saveRides(rides) {
    localStorage.setItem("rides", JSON.stringify(rides));
}

function getContacts() {
    return JSON.parse(localStorage.getItem("contacts")) || [];
}
function saveContacts(contacts) {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem("loggedInUser")) || null;
}
function saveLoggedInUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

/* =========================
   UI HELPERS
========================= */
function showMessage(elId, message, type = "success") {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = `<p style="color:${type === "success" ? "green" : "red"}; font-weight:600;">${message}</p>`;
}

function toggleMenu() {
    const nav = document.getElementById("navMenu");
    if (nav) nav.classList.toggle("show");
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("rideezTheme", isDark ? "dark" : "light");
}

function loadTheme() {
    const theme = localStorage.getItem("rideezTheme");
    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    }
}

function togglePassword(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        if (iconEl) iconEl.textContent = "🙈";
    } else {
        input.type = "password";
        if (iconEl) iconEl.textContent = "👁️";
    }
}

/* =========================
   SIGNUP
========================= */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const phone = document.getElementById("signupPhone").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value.trim();
        const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();

        if (password !== confirmPassword) {
            showMessage("signupMsg", "Passwords do not match.", "error");
            return;
        }

        const users = getUsers();
        const exists = users.some(user => (user.email || "").toLowerCase() === email);

        if (exists) {
            showMessage("signupMsg", "Email already registered.", "error");
            return;
        }

        const newUser = {
            id: "USER" + Date.now(),
            name,
            phone,
            email,
            password,
            role: "User",
            createdAt: new Date().toLocaleString()
        };

        users.push(newUser);
        saveUsers(users);

        showMessage("signupMsg", "Account created successfully. Now login.");
        signupForm.reset();
    });
}

/* =========================
   LOGIN
========================= */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();

        // demo admin
        if (email === "admin@rideez.com" && password === "admin123") {
            const adminUser = {
                id: "ADMIN1",
                name: "RideEZ Admin",
                email: "admin@rideez.com",
                phone: "",
                role: "Admin"
            };
            saveLoggedInUser(adminUser);
            showMessage("loginMsg", "Admin login successful.");
            setTimeout(() => {
                window.location.href = "admin.html";
            }, 800);
            return;
        }

        const users = getUsers();
        const foundUser = users.find(user =>
            (user.email || "").toLowerCase() === email &&
            user.password === password
        );

        if (!foundUser) {
            showMessage("loginMsg", "Invalid email or password.", "error");
            return;
        }

        saveLoggedInUser(foundUser);
        showMessage("loginMsg", "Login successful.");

        setTimeout(() => {
            window.location.href = "user-dashboard.html";
        }, 800);
    });
}

/* =========================
   AUTO FILL BOOK RIDE USER
========================= */
function autofillRideUserData() {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return;

    const rideName = document.getElementById("rideName");
    const ridePhone = document.getElementById("ridePhone");

    if (rideName && loggedInUser.name) rideName.value = loggedInUser.name;
    if (ridePhone && loggedInUser.phone) ridePhone.value = loggedInUser.phone;
}

/* =========================
   FARE CALCULATION
========================= */
function calculateFare() {
    const vehicle = document.getElementById("vehicle")?.value;
    const distance = parseFloat(document.getElementById("distance")?.value);
    const fareBox = document.getElementById("fareBox");

    if (!fareBox) return;

    if (!vehicle || !distance || distance <= 0) {
        fareBox.innerHTML = `<p style="color:red;">Please select vehicle and enter valid distance.</p>`;
        return;
    }

    let rate = 0;
    if (vehicle === "Bike") rate = 8;
    else if (vehicle === "Auto") rate = 15;
    else if (vehicle === "Cab") rate = 22;

    const fare = distance * rate;

    fareBox.innerHTML = `
        <div class="fare-details">
            <h4>Estimated Fare</h4>
            <p><strong>Vehicle:</strong> ${vehicle}</p>
            <p><strong>Distance:</strong> ${distance} KM</p>
            <p><strong>Total Fare:</strong> ₹${fare}</p>
        </div>
    `;
}

/* =========================
   BOOK RIDE
========================= */
const rideForm = document.getElementById("rideForm");
if (rideForm) {
    rideForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const loggedInUser = getLoggedInUser();
        if (!loggedInUser) {
            showMessage("rideMsg", "Please login first to book a ride.", "error");
            return;
        }

        const name = document.getElementById("rideName").value.trim();
        const phone = document.getElementById("ridePhone").value.trim();
        const pickup = document.getElementById("pickup").value.trim();
        const drop = document.getElementById("drop").value.trim();
        const vehicle = document.getElementById("vehicle").value;
        const distance = parseFloat(document.getElementById("distance").value);
        const paymentMethod = document.getElementById("paymentMethod").value;

        if (!name || !phone || !pickup || !drop || !vehicle || !distance || !paymentMethod) {
            showMessage("rideMsg", "Please fill all ride details.", "error");
            return;
        }

        let rate = 0;
        if (vehicle === "Bike") rate = 8;
        else if (vehicle === "Auto") rate = 15;
        else if (vehicle === "Cab") rate = 22;

        const fare = distance * rate;

        const rides = getRides();

        const rideData = {
            bookingId: "RIDE" + Date.now(),
            userId: loggedInUser.id || loggedInUser.email,
            name,
            phone,
            email: loggedInUser.email || "",
            pickup,
            drop,
            vehicle,
            distance,
            fare,
            paymentMethod,
            status: "Booked",
            driverAssigned: "Not Assigned",
            driverPhone: "",
            assignedDriverId: "",
            bookedAt: new Date().toLocaleString(),

            // demo tracking fields
            liveTracking: false,
            driverLat: null,
            driverLng: null,
            lastUpdated: null
        };

        rides.push(rideData);
        saveRides(rides);

        showMessage("rideMsg", `Ride booked successfully! Booking ID: ${rideData.bookingId}`);
        rideForm.reset();

        const fareBox = document.getElementById("fareBox");
        if (fareBox) fareBox.innerHTML = `<p>Fare details will appear here</p>`;

        autofillRideUserData();
    });
}

/* =========================
   USER DASHBOARD
========================= */
function loadUserDashboard() {
    const rideList = document.getElementById("rideList");
    if (!rideList) return;

    const loggedInUser = getLoggedInUser();

    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const userPhone = document.getElementById("userPhone");
    const userRole = document.getElementById("userRole");
    const userNameHeading = document.getElementById("userNameHeading");
    const userAvatar = document.getElementById("userAvatar");

    const totalRides = document.getElementById("totalRides");
    const totalSpent = document.getElementById("totalSpent");
    const lastRide = document.getElementById("lastRide");

    if (!loggedInUser) {
        rideList.innerHTML = `
            <div class="empty-message">
                <h3>Please login first</h3>
                <p>You need to login to view your dashboard.</p>
            </div>
        `;
        return;
    }

    if (userName) userName.textContent = loggedInUser.name || "-";
    if (userEmail) userEmail.textContent = loggedInUser.email || "-";
    if (userPhone) userPhone.textContent = loggedInUser.phone || "-";
    if (userRole) userRole.textContent = loggedInUser.role || "User";
    if (userNameHeading) userNameHeading.textContent = loggedInUser.name || "User Profile";
    if (userAvatar) userAvatar.textContent = (loggedInUser.name || "U").charAt(0).toUpperCase();

    const rides = getRides();

    const myRides = rides.filter(ride => {
        const rideEmail = (ride.email || "").trim().toLowerCase();
        const ridePhone = (ride.phone || "").trim();
        const userEmailValue = (loggedInUser.email || "").trim().toLowerCase();
        const userPhoneValue = (loggedInUser.phone || "").trim();
        return rideEmail === userEmailValue || ridePhone === userPhoneValue;
    });

    if (myRides.length === 0) {
        rideList.innerHTML = `
            <div class="empty-message">
                <h3>No rides booked yet</h3>
                <p>Your ride bookings will appear here once you make a booking.</p>
            </div>
        `;
        if (totalRides) totalRides.textContent = "0";
        if (totalSpent) totalSpent.textContent = "₹0";
        if (lastRide) lastRide.textContent = "No rides";
        return;
    }

    let totalFare = 0;
    myRides.forEach(ride => totalFare += Number(ride.fare || 0));

    if (totalRides) totalRides.textContent = myRides.length;
    if (totalSpent) totalSpent.textContent = `₹${totalFare}`;
    if (lastRide) lastRide.textContent = myRides[myRides.length - 1]?.drop || "Ride Booked";

    const reversedRides = [...myRides].reverse();

    rideList.innerHTML = reversedRides.map(ride => `
        <div class="ride-card">
            <div class="ride-card-top">
                <h3>${ride.bookingId}</h3>
                <span class="ride-status">${ride.status || "Booked"}</span>
            </div>

            <div class="ride-card-body">
                <p><strong>Pickup:</strong> ${ride.pickup}</p>
                <p><strong>Drop:</strong> ${ride.drop}</p>
                <p><strong>Vehicle:</strong> ${ride.vehicle}</p>
                <p><strong>Distance:</strong> ${ride.distance} KM</p>
                <p><strong>Fare:</strong> ₹${ride.fare}</p>
                <p><strong>Payment:</strong> ${ride.paymentMethod}</p>
                <p><strong>Driver:</strong> ${ride.driverAssigned || "Not Assigned"}</p>
                <p><strong>Booked At:</strong> ${ride.bookedAt || "-"}</p>
            </div>

            <div class="ride-card-actions">
                ${ride.driverAssigned !== "Not Assigned"
            ? `<a href="track-ride.html?id=${ride.bookingId}" class="track-btn">Track Ride</a>`
            : `<button class="track-btn" disabled style="opacity:.6; cursor:not-allowed;">Waiting for Driver</button>`
        }
            </div>
        </div>
    `).join("");
}

function clearRideHistory() {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return;

    let rides = getRides();

    rides = rides.filter(ride => {
        const rideEmail = (ride.email || "").trim().toLowerCase();
        const ridePhone = (ride.phone || "").trim();
        const userEmailValue = (loggedInUser.email || "").trim().toLowerCase();
        const userPhoneValue = (loggedInUser.phone || "").trim();
        return !(rideEmail === userEmailValue || ridePhone === userPhoneValue);
    });

    saveRides(rides);
    loadUserDashboard();
}

/* =========================
   EDIT USER PROFILE
========================= */
function openEditProfileModal() {
    const modal = document.getElementById("editProfileModal");
    const loggedInUser = getLoggedInUser();
    if (!modal || !loggedInUser) return;

    document.getElementById("editUserName").value = loggedInUser.name || "";
    document.getElementById("editUserEmail").value = loggedInUser.email || "";
    document.getElementById("editUserPhone").value = loggedInUser.phone || "";

    modal.style.display = "flex";
}
function closeEditProfileModal() {
    const modal = document.getElementById("editProfileModal");
    if (modal) modal.style.display = "none";
}

const editProfileForm = document.getElementById("editProfileForm");
if (editProfileForm) {
    editProfileForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const loggedInUser = getLoggedInUser();
        if (!loggedInUser) return;

        const newName = document.getElementById("editUserName").value.trim();
        const newEmail = document.getElementById("editUserEmail").value.trim().toLowerCase();
        const newPhone = document.getElementById("editUserPhone").value.trim();

        let users = getUsers();
        const index = users.findIndex(u => u.id === loggedInUser.id);

        if (index !== -1) {
            users[index].name = newName;
            users[index].email = newEmail;
            users[index].phone = newPhone;
            saveUsers(users);

            loggedInUser.name = newName;
            loggedInUser.email = newEmail;
            loggedInUser.phone = newPhone;
            saveLoggedInUser(loggedInUser);

            showMessage("editProfileMsg", "Profile updated successfully.");
            loadUserDashboard();

            setTimeout(() => {
                closeEditProfileModal();
            }, 700);
        }
    });
}

/* =========================
   LOGOUT
========================= */
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

/* =========================
   DRIVER REGISTRATION
========================= */
const driverForm = document.getElementById("driverForm");
if (driverForm) {
    driverForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const driverName = document.getElementById("driverName").value.trim();
        const driverPhone = document.getElementById("driverPhone").value.trim();
        const driverEmail = document.getElementById("driverEmail")?.value.trim() || "";
        const driverCity = document.getElementById("driverCity").value.trim();
        const vehicleNumber = document.getElementById("vehicleNumber").value.trim();
        const vehicleType = document.getElementById("vehicleType").value;
        const licenseNumber = document.getElementById("licenseNumber").value.trim();
        const experience = document.getElementById("experience").value;

        const drivers = getDrivers();

        const newDriver = {
            id: "DRIVER" + Date.now(),
            name: driverName,
            phone: driverPhone,
            email: driverEmail,
            city: driverCity,
            vehicleNumber,
            vehicleType,
            licenseNumber,
            experience,
            createdAt: new Date().toLocaleString()
        };

        drivers.push(newDriver);
        saveDrivers(drivers);

        showMessage("driverMsg", "Driver registered successfully.");
        driverForm.reset();
    });
}

/* =========================
   DRIVER DASHBOARD
========================= */
function loadDriverDashboard() {
    const driverList = document.getElementById("driverList");
    if (!driverList) return;

    const drivers = getDrivers();
    const rides = getRides();

    const totalDrivers = document.getElementById("totalDrivers");
    const activeDrivers = document.getElementById("activeDrivers");
    const todayDrivers = document.getElementById("todayDrivers");
    const assignedRideList = document.getElementById("assignedRideList");

    if (totalDrivers) totalDrivers.textContent = drivers.length;
    if (activeDrivers) {
        const assignedDrivers = new Set(rides.filter(r => r.assignedDriverId).map(r => r.assignedDriverId));
        activeDrivers.textContent = assignedDrivers.size;
    }
    if (todayDrivers) totalDrivers && (todayDrivers.textContent = drivers.length);

    if (drivers.length === 0) {
        driverList.innerHTML = `
            <div class="empty-message">
                <h3>No drivers registered yet</h3>
                <p>Driver registrations will appear here.</p>
            </div>
        `;
    } else {
        driverList.innerHTML = drivers.map(driver => `
            <div class="driver-card">
                <h3>${driver.name}</h3>
                <p><strong>Phone:</strong> ${driver.phone}</p>
                <p><strong>City:</strong> ${driver.city}</p>
                <p><strong>Vehicle:</strong> ${driver.vehicleType}</p>
                <p><strong>Vehicle No:</strong> ${driver.vehicleNumber}</p>
                <p><strong>Experience:</strong> ${driver.experience}</p>
            </div>
        `).join("");
    }

    if (!assignedRideList) return;

    const assignedRides = rides.filter(ride => ride.assignedDriverId);

    if (assignedRides.length === 0) {
        assignedRideList.innerHTML = `
            <div class="empty-message">
                <h3>No assigned rides yet</h3>
                <p>Assigned rides will appear here after admin assigns them.</p>
            </div>
        `;
    } else {
        assignedRideList.innerHTML = assignedRides.map(ride => `
            <div class="ride-card">
                <div class="ride-card-top">
                    <h3>${ride.bookingId}</h3>
                    <span class="ride-status">${ride.status}</span>
                </div>

                <div class="ride-card-body">
                    <p><strong>Customer:</strong> ${ride.name}</p>
                    <p><strong>Phone:</strong> ${ride.phone}</p>
                    <p><strong>Pickup:</strong> ${ride.pickup}</p>
                    <p><strong>Drop:</strong> ${ride.drop}</p>
                    <p><strong>Driver:</strong> ${ride.driverAssigned}</p>
                    <p><strong>Vehicle:</strong> ${ride.vehicle}</p>
                </div>

                <div class="ride-card-actions">
                    <button class="live-btn" onclick="startDriverLiveTracking('${ride.bookingId}')">Start Live Tracking</button>
                    <button class="complete-btn" onclick="markRideCompleted('${ride.bookingId}')">Complete Ride</button>
                </div>
            </div>
        `).join("");
    }
}

function markRideCompleted(bookingId) {
    const rides = getRides();
    const index = rides.findIndex(r => r.bookingId === bookingId);
    if (index === -1) return;

    rides[index].status = "Completed";
    rides[index].liveTracking = false;
    saveRides(rides);

    alert("Ride marked as completed.");
    loadDriverDashboard();
    loadAdminDashboard();
    loadUserDashboard();
}

/* =========================
   ADMIN DASHBOARD
========================= */
function loadAdminDashboard() {
    const usersList = document.getElementById("usersList");
    const driversList = document.getElementById("driversList");
    const ridesList = document.getElementById("ridesList");
    const contactsList = document.getElementById("contactsList");

    if (!usersList && !driversList && !ridesList && !contactsList) return;

    const users = getUsers();
    const drivers = getDrivers();
    const rides = getRides();
    const contacts = getContacts();

    const totalUsers = document.getElementById("totalUsers");
    const totalDrivers = document.getElementById("totalDrivers");
    const totalRides = document.getElementById("totalRides");
    const totalContacts = document.getElementById("totalContacts");

    if (totalUsers) totalUsers.textContent = users.length;
    if (totalDrivers) totalDrivers.textContent = drivers.length;
    if (totalRides) totalRides.textContent = rides.length;
    if (totalContacts) totalContacts.textContent = contacts.length;

    if (usersList) {
        usersList.innerHTML = users.length ? users.map(user => `
            <div class="admin-card">
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone}</p>
                <p><strong>Role:</strong> ${user.role}</p>
            </div>
        `).join("") : `
            <div class="empty-message">
                <h3>No users found</h3>
            </div>
        `;
    }

    if (driversList) {
        driversList.innerHTML = drivers.length ? drivers.map(driver => `
            <div class="admin-card">
                <h3>${driver.name}</h3>
                <p><strong>Phone:</strong> ${driver.phone}</p>
                <p><strong>City:</strong> ${driver.city}</p>
                <p><strong>Vehicle:</strong> ${driver.vehicleType}</p>
                <p><strong>Vehicle No:</strong> ${driver.vehicleNumber}</p>
            </div>
        `).join("") : `
            <div class="empty-message">
                <h3>No drivers found</h3>
            </div>
        `;
    }

    if (ridesList) {
        ridesList.innerHTML = rides.length ? rides.map(ride => {
            const driverOptions = drivers.map(driver => `
                <option value="${driver.id}" ${ride.assignedDriverId === driver.id ? "selected" : ""}>
                    ${driver.name} (${driver.vehicleType})
                </option>
            `).join("");

            return `
                <div class="ride-card">
                    <div class="ride-card-top">
                        <h3>${ride.bookingId}</h3>
                        <span class="ride-status">${ride.status}</span>
                    </div>

                    <div class="ride-card-body">
                        <p><strong>User:</strong> ${ride.name}</p>
                        <p><strong>Phone:</strong> ${ride.phone}</p>
                        <p><strong>Pickup:</strong> ${ride.pickup}</p>
                        <p><strong>Drop:</strong> ${ride.drop}</p>
                        <p><strong>Vehicle:</strong> ${ride.vehicle}</p>
                        <p><strong>Fare:</strong> ₹${ride.fare}</p>
                        <p><strong>Driver:</strong> ${ride.driverAssigned || "Not Assigned"}</p>

                        <select class="assign-select" id="assign-${ride.bookingId}">
                            <option value="">Select Driver</option>
                            ${driverOptions}
                        </select>
                    </div>

                    <div class="ride-card-actions">
                        <button class="assign-btn" onclick="assignDriverToRide('${ride.bookingId}')">Assign Driver</button>
                    </div>
                </div>
            `;
        }).join("") : `
            <div class="empty-message">
                <h3>No rides found</h3>
            </div>
        `;
    }

    if (contactsList) {
        contactsList.innerHTML = contacts.length ? contacts.map(contact => `
            <div class="admin-card">
                <h3>${contact.name}</h3>
                <p><strong>Phone:</strong> ${contact.phone}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Subject:</strong> ${contact.subject}</p>
                <p><strong>Message:</strong> ${contact.message}</p>
            </div>
        `).join("") : `
            <div class="empty-message">
                <h3>No contact messages found</h3>
            </div>
        `;
    }
}

function assignDriverToRide(bookingId) {
    const select = document.getElementById(`assign-${bookingId}`);
    if (!select || !select.value) {
        alert("Please select a driver first.");
        return;
    }

    const driverId = select.value;
    const drivers = getDrivers();
    const rides = getRides();

    const selectedDriver = drivers.find(driver => driver.id === driverId);
    const rideIndex = rides.findIndex(ride => ride.bookingId === bookingId);

    if (!selectedDriver || rideIndex === -1) return;

    rides[rideIndex].assignedDriverId = selectedDriver.id;
    rides[rideIndex].driverAssigned = selectedDriver.name;
    rides[rideIndex].driverPhone = selectedDriver.phone;
    rides[rideIndex].status = "Driver Assigned";
    rides[rideIndex].liveTracking = false;

    saveRides(rides);
    alert("Driver assigned successfully.");

    loadAdminDashboard();
    loadDriverDashboard();
    loadUserDashboard();
}

/* =========================
   CONTACT FORM
========================= */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const phone = document.getElementById("contactPhone").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        const contacts = getContacts();
        contacts.push({
            id: "CONTACT" + Date.now(),
            name,
            phone,
            email,
            subject,
            message,
            createdAt: new Date().toLocaleString()
        });
        saveContacts(contacts);

        showMessage("contactMsg", "Message sent successfully.");
        contactForm.reset();
    });
}

/* =========================
   DRIVER DEMO LIVE TRACKING
   (Same browser demo)
========================= */
let driverTrackingIntervals = {};

function startDriverLiveTracking(bookingId) {
    const rides = getRides();
    const rideIndex = rides.findIndex(r => r.bookingId === bookingId);
    if (rideIndex === -1) return;

    // already running?
    if (driverTrackingIntervals[bookingId]) {
        alert("Live tracking already started for this ride.");
        return;
    }

    // initial demo location (Pune coords)
    if (!rides[rideIndex].driverLat || !rides[rideIndex].driverLng) {
        rides[rideIndex].driverLat = 18.5204;
        rides[rideIndex].driverLng = 73.8567;
    }

    rides[rideIndex].status = "On the way";
    rides[rideIndex].liveTracking = true;
    rides[rideIndex].lastUpdated = new Date().toLocaleTimeString();
    saveRides(rides);

    alert("Demo live tracking started.");

    // demo movement every 4 sec
    driverTrackingIntervals[bookingId] = setInterval(() => {
        let updatedRides = getRides();
        let idx = updatedRides.findIndex(r => r.bookingId === bookingId);
        if (idx === -1) return;

        // if ride completed stop
        if (updatedRides[idx].status === "Completed") {
            clearInterval(driverTrackingIntervals[bookingId]);
            delete driverTrackingIntervals[bookingId];
            return;
        }

        let lat = updatedRides[idx].driverLat || 18.5204;
        let lng = updatedRides[idx].driverLng || 73.8567;

        // fake movement
        lat = lat + (Math.random() * 0.002 - 0.001);
        lng = lng + (Math.random() * 0.002 - 0.001);

        updatedRides[idx].driverLat = Number(lat.toFixed(6));
        updatedRides[idx].driverLng = Number(lng.toFixed(6));
        updatedRides[idx].status = "Driver Reaching Pickup";
        updatedRides[idx].liveTracking = true;
        updatedRides[idx].lastUpdated = new Date().toLocaleTimeString();

        saveRides(updatedRides);
    }, 4000);

    loadDriverDashboard();
    loadUserDashboard();
    loadAdminDashboard();
}

/* =========================
   TRACK RIDE PAGE (LEAFLET)
========================= */
function loadTrackRidePage() {
    const mapBox = document.getElementById("map");
    if (!mapBox) return;

    const infoBox = document.getElementById("trackRideInfo");
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("id");

    if (!bookingId) {
        if (infoBox) infoBox.textContent = "No ride selected.";
        return;
    }

    let rides = getRides();
    let ride = rides.find(r => r.bookingId === bookingId);

    if (!ride) {
        if (infoBox) infoBox.textContent = "Ride not found.";
        return;
    }

    const lat = ride.driverLat || 18.5204;
    const lng = ride.driverLng || 73.8567;

    const map = L.map("map").setView([lat, lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    const driverMarker = L.marker([lat, lng]).addTo(map).bindPopup("Driver Location").openPopup();

    if (infoBox) {
        infoBox.innerHTML = `
            <strong>Booking ID:</strong> ${ride.bookingId}<br>
            <strong>Driver:</strong> ${ride.driverAssigned || "Not Assigned"}<br>
            <strong>Status:</strong> ${ride.status || "Booked"}<br>
            <strong>Pickup:</strong> ${ride.pickup}<br>
            <strong>Drop:</strong> ${ride.drop}<br>
            <strong>Last Updated:</strong> ${ride.lastUpdated || "-"}
        `;
    }

    setInterval(() => {
        let latestRides = getRides();
        let updatedRide = latestRides.find(r => r.bookingId === bookingId);
        if (!updatedRide) return;

        if (updatedRide.driverLat && updatedRide.driverLng) {
            driverMarker.setLatLng([updatedRide.driverLat, updatedRide.driverLng]);
            map.setView([updatedRide.driverLat, updatedRide.driverLng], 15);

            if (infoBox) {
                infoBox.innerHTML = `
                    <strong>Booking ID:</strong> ${updatedRide.bookingId}<br>
                    <strong>Driver:</strong> ${updatedRide.driverAssigned || "Not Assigned"}<br>
                    <strong>Status:</strong> ${updatedRide.status || "Booked"}<br>
                    <strong>Pickup:</strong> ${updatedRide.pickup}<br>
                    <strong>Drop:</strong> ${updatedRide.drop}<br>
                    <strong>Last Updated:</strong> ${updatedRide.lastUpdated || "-"}
                `;
            }
        }
    }, 3000);
}

/* =========================
   ADMIN CLEAR FUNCTIONS
========================= */
function clearUsers() {
    if (confirm("Clear all users?")) {
        localStorage.removeItem("users");
        loadAdminDashboard();
    }
}
function clearDrivers() {
    if (confirm("Clear all drivers?")) {
        localStorage.removeItem("drivers");
        loadAdminDashboard();
        loadDriverDashboard();
    }
}
function clearRides() {
    if (confirm("Clear all rides?")) {
        localStorage.removeItem("rides");
        loadAdminDashboard();
        loadDriverDashboard();
        loadUserDashboard();
    }
}
function clearContacts() {
    if (confirm("Clear all contact messages?")) {
        localStorage.removeItem("contacts");
        loadAdminDashboard();
    }
}

/* =========================
   PAGE LOAD
========================= */
document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
    autofillRideUserData();
    loadUserDashboard();
    loadDriverDashboard();
    loadAdminDashboard();
    loadTrackRidePage();
});
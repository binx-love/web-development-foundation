// ========================================
// Day 5 - User Directory
// ========================================

// Select page elements
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Store users returned by the API
let users = [];


// ========================================
// Render users
// ========================================

function renderUsers(list) {

    // Clear the existing list
    usersList.textContent = "";

    // Show a message when the filter has no matches
    if (list.length === 0) {

        const message = document.createElement("li");
        message.textContent = "No users match your filter.";

        usersList.appendChild(message);

        return;
    }

    // Create a list item for every user
    list.forEach(user => {

        const listItem = document.createElement("li");

        const name = document.createElement("h3");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement("p");
        city.textContent = `City: ${user.address.city}`;

        const company = document.createElement("p");
        company.textContent = `Company: ${user.company.name}`;

        listItem.appendChild(name);
        listItem.appendChild(email);
        listItem.appendChild(city);
        listItem.appendChild(company);

        usersList.appendChild(listItem);
    });
}


// ========================================
// Load users from the API
// ========================================

async function loadUsers() {

    loadButton.disabled = true;
    statusMessage.textContent = "Loading users...";

    try {

        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        users = await response.json();

        statusMessage.textContent =
            `Successfully loaded ${users.length} users.`;

        renderUsers(users);

    } catch (error) {

        console.error("Error loading users:", error);

        statusMessage.textContent =
            "Unable to load users. Please try again.";

        usersList.textContent = "";

    } finally {

        loadButton.disabled = false;
    }
}


// ========================================
// Filter users
// ========================================

filterInput.addEventListener("input", () => {

    const searchTerm = filterInput.value.trim().toLowerCase();

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm)
    );

    renderUsers(filteredUsers);
});


// ========================================
// Load button
// ========================================

loadButton.addEventListener("click", loadUsers);
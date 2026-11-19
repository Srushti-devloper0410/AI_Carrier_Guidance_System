
/* =====================================
   CAREER EXPLORER - COMMON JAVASCRIPT
===================================== */

// Get current category from HTML body
const category = document.body.dataset.category || "general";

// Get all career cards
const careerCards = document.querySelectorAll(".career-card");

// Get shortlist elements
const shortlistCount = document.getElementById("shortlistCount");
const shortlistList = document.getElementById("shortlistList");

// LocalStorage key for all categories
const STORAGE_KEY = "careerShortlist";

// Get saved shortlist
function getShortlist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

// Save shortlist
function saveShortlist(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Get selected careers for current category
function getCategoryShortlist() {
    const data = getShortlist();
    return data[category] || [];
}

// Update shortlist display
function updateShortlist() {

    const selectedCareers = getCategoryShortlist();

    // Update count
    if (shortlistCount) {
        shortlistCount.textContent = selectedCareers.length;
    }

    // Update list
    if (shortlistList) {

        shortlistList.innerHTML = "";

        if (selectedCareers.length === 0) {
            shortlistList.innerHTML = "<p>No careers selected yet.</p>";
            return;
        }

        selectedCareers.forEach(career => {

            const item = document.createElement("div");

            item.className = "shortlist-item";

            const name = document.createElement("span");
            name.textContent = career;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.className = "btn btn-outline";

            removeButton.addEventListener("click", () => {
                removeCareer(career);
            });

            item.appendChild(name);
            item.appendChild(removeButton);

            shortlistList.appendChild(item);
        });
    }
}

// Add or remove career from shortlist
function toggleCareer(careerName, card) {

    const data = getShortlist();

    if (!data[category]) {
        data[category] = [];
    }

    const index = data[category].indexOf(careerName);

    if (index === -1) {
        data[category].push(careerName);

        if (card) {
            card.classList.add("selected");
        }

    } else {
        data[category].splice(index, 1);

        if (card) {
            card.classList.remove("selected");
        }
    }

    saveShortlist(data);
    updateShortlist();
}

// Remove career from shortlist
function removeCareer(careerName) {

    const data = getShortlist();

    if (!data[category]) return;

    data[category] = data[category].filter(
        career => career !== careerName
    );

    saveShortlist(data);

    updateCardSelection();
    updateShortlist();
}

// Highlight previously selected cards
function updateCardSelection() {

    const selectedCareers = getCategoryShortlist();

    careerCards.forEach(card => {

        const careerName = card.dataset.career;

        if (selectedCareers.includes(careerName)) {
            card.classList.add("selected");
        } else {
            card.classList.remove("selected");
        }
    });
}

// Attach click events to all career cards
careerCards.forEach(card => {

    const button = card.querySelector(".select-career");

    if (!button) return;

    button.addEventListener("click", () => {

        const careerName = card.dataset.career;

        if (!careerName) return;

        toggleCareer(careerName, card);

    });
});

// Initialize page
updateCardSelection();
updateShortlist();

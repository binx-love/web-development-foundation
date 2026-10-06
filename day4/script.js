// Select the required elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");


// Update the character and word counters
function updateCounts() {
    const text = noteText.value;

    const characters = text.length;

    const words = text.trim() === ""
        ? 0
        : text.trim().split(/\s+/).length;

    charCount.textContent = `${characters} / 200 characters`;
    wordCount.textContent = `${words} words`;

    // Remove old warning classes
    charCount.classList.remove("warning", "over");

    // Add the correct class
    if (characters > 200) {
        charCount.classList.add("over");
    } else if (characters > 180) {
        charCount.classList.add("warning");
    }
}


// Save the current note as a draft
function saveDraft() {
    localStorage.setItem("noteDraft", noteText.value);
}


// Handle every input event
noteText.addEventListener("input", () => {
    updateCounts();
    saveDraft();
});


// Clear the note and remove the saved draft
function clearNote() {
    noteText.value = "";

    updateCounts();

    localStorage.removeItem("noteDraft");
}


// Clear button
clearBtn.addEventListener("click", clearNote);


// Escape key clears the note
noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearNote();
    }
});


// Update the theme button label
function updateThemeButton() {
    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "Light mode";
    } else {
        themeToggle.textContent = "Dark mode";
    }
}


// Theme toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const darkModeEnabled = document.body.classList.contains("dark");

    localStorage.setItem("darkMode", darkModeEnabled);

    updateThemeButton();
});


// Restore saved data when the page loads
const savedDraft = localStorage.getItem("noteDraft");

if (savedDraft !== null) {
    noteText.value = savedDraft;
}


// Restore the saved theme
const savedTheme = localStorage.getItem("darkMode");

if (savedTheme === "true") {
    document.body.classList.add("dark");
}


// Set the correct counters and button label on page load
updateCounts();
updateThemeButton();
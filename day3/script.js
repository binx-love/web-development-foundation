// ========================================
// Notes Toolkit - Day 3
// ========================================

// Starting data
let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];


// ========================================
// 1. searchNotes
// ========================================

function searchNotes(word) {
    const searchWord = word.toLowerCase();

    return notes.filter(note =>
        note.text.toLowerCase().includes(searchWord)
    );
}

// Normal case
console.log(searchNotes("day"));
// Expected: [{ id: 2, text: "Finish the Day 3 assignment", category: "study" }]

// Edge case - no matching notes
console.log(searchNotes("pizza"));
// Expected: []


// ========================================
// 2. longestNote
// ========================================

function longestNote() {
    if (notes.length === 0) {
        return null;
    }

    return notes.reduce((longest, current) => {
        if (current.text.length > longest.text.length) {
            return current;
        }

        return longest;
    });
}

// Normal case
console.log(longestNote());
// Expected: { id: 2, text: "Finish the Day 3 assignment", category: "study" }

// Edge case - empty array
const savedNotesForLongest = notes;
notes = [];

console.log(longestNote());
// Expected: null

notes = savedNotesForLongest;


// ========================================
// 3. countByCategory
// ========================================

function countByCategory() {
    const counts = {
        personal: 0,
        work: 0,
        study: 0
    };

    notes.forEach(note => {
        counts[note.category]++;
    });

    return counts;
}

// Normal case
console.log(countByCategory());
// Expected: { personal: 2, work: 1, study: 2 }

// Edge case - empty array
const savedNotesForCount = notes;
notes = [];

console.log(countByCategory());
// Expected: { personal: 0, work: 0, study: 0 }

notes = savedNotesForCount;


// ========================================
// 4. getSummary
// ========================================

function getSummary() {
    const counts = countByCategory();

    const noteWord = notes.length === 1 ? "note" : "notes";

    return `${notes.length} ${noteWord}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}

// Normal case
console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

// Edge case - exactly one note
const savedNotesForSummary = notes;
notes = [
    { id: 6, text: "Study", category: "study" }
];

console.log(getSummary());
// Expected: "1 note: 0 personal, 0 work, 1 study."

notes = savedNotesForSummary;


// ========================================
// 5. isDuplicate
// ========================================

function isDuplicate(text) {
    const cleanedText = text.trim().toLowerCase();

    return notes.some(note =>
        note.text.trim().toLowerCase() === cleanedText
    );
}

// Normal case - existing note
console.log(isDuplicate("Buy milk and bread"));
// Expected: true

// Edge case - different text
console.log(isDuplicate("Go to the supermarket"));
// Expected: false


// ========================================
// 6. addNote
// ========================================

function addNote(text, category) {

    const cleanedText = text.trim();

    // Check text length
    if (cleanedText.length < 1 || cleanedText.length > 200) {
        console.log("Note not added: text must be between 1 and 200 characters.");
        return false;
    }

    // Check duplicate
    if (isDuplicate(cleanedText)) {
        console.log("Note not added: duplicate text.");
        return false;
    }

    // Check category
    const validCategories = ["personal", "work", "study"];

    if (!validCategories.includes(category)) {
        console.log("Note not added: invalid category.");
        return false;
    }

    // Create the next ID
    const newId = notes.length > 0
        ? Math.max(...notes.map(note => note.id)) + 1
        : 1;

    notes.push({
        id: newId,
        text: cleanedText,
        category: category
    });

    console.log("Note added successfully.");

    return true;
}


// Normal case - valid new note
console.log(addNote("Prepare presentation slides", "work"));
// Expected: true

// Edge case - duplicate note
console.log(addNote("  BUY   MILK   AND   BREAD  ", "personal"));
// Expected: false

// Edge case - invalid category
console.log(addNote("Learn JavaScript", "school"));
// Expected: false

// Edge case - empty text
console.log(addNote("", "study"));
// Expected: false
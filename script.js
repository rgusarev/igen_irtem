// --- 1. GET HTML ELEMENTS ---
const tableCardsContainer = document.getElementById('tableCards');
const vocabularySelector = document.getElementById('vocabularySelector'); // New: dropdown element
const reloadWordsButton = document.getElementById('reloadWordsButton');

// --- 2. DEFINE YOUR VOCABULARIES ---
// This is where you map display names to the raw URLs of your CSV files on GitHub.
const vocabularies = {
  // Use a "placeholder" or default value for the first option
  "default": { name: "Select a vocabulary...", url: "" },

  "italian-numerals": {
    name: "Italian Numerals",
    url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/italian_numerals.csv"
  },
  "italian-irr-verbs": {
    name: "Italian Irregular Verbs",
    url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/italian_irregular_verbs_conj.csv"
  },
  "italian-introductory": {
    name: "Italian introductory words",
    url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/italian_introductory_words.csv"
  }
};

// Global variable to hold the currently loaded words
let wordsData = [];
const MIN_WORDS_FOR_GRID = 25;

// --- UTILITY FUNCTIONS (Unchanged) ---

// Function to shuffle an array (Fisher-Yates Algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to parse CSV text
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const wordsArray = [];
  for (const line of lines) {
    const regex = /("([^"]*)"|[^,]*)(,|$)/g;
    let match;
    let cells = [];
    while ((match = regex.exec(line)) !== null && match[0] !== '') {
      cells.push(match[2] || match[1].replace(/^"|"$/g, ''));
    }
    if (cells.length === 2) {
      const cleanedCells = cells.map(cell => cell.trim());
      if (cleanedCells[0] && cleanedCells[1]) {
        wordsArray.push(cleanedCells);
      }
    }
  }
  return wordsArray;
}

// Function to create and display cards
function createAndDisplayCards(wordsToDisplay) {
  tableCardsContainer.innerHTML = '';
  if (!wordsToDisplay || wordsToDisplay.length === 0) {
    tableCardsContainer.innerHTML = '<p>No words available. Please select a vocabulary.</p>';
    return;
  }

  const shuffledWords = shuffleArray([...wordsToDisplay]); // Create a copy to shuffle
  let count = 0;

  for (let i = 0; i < 5; i++) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'center';

    for (let j = 0; j < 5; j++) {
      if (count >= shuffledWords.length || count >= MIN_WORDS_FOR_GRID) break;

      const cardDiv = document.createElement('div');
      cardDiv.className = 'card';
      const flipCardDiv = document.createElement('div');
      flipCardDiv.className = 'flipCard';
      const frontFace = document.createElement('div');
      frontFace.className = 'face front';
      frontFace.innerHTML = shuffledWords[count][0];
      const backFace = document.createElement('div');
      backFace.className = 'face back';
      backFace.innerHTML = shuffledWords[count][1];

      flipCardDiv.appendChild(frontFace);
      flipCardDiv.appendChild(backFace);
      cardDiv.appendChild(flipCardDiv);

      cardDiv.addEventListener('click', () => {
        flipCardDiv.classList.toggle('flipped');
      });

      row.appendChild(cardDiv);
      count++;
    }
    tableCardsContainer.appendChild(row);
    if (count >= shuffledWords.length || count >= MIN_WORDS_FOR_GRID) break;
  }
}

// --- 3. NEW: FUNCTION TO LOAD VOCABULARY FROM A URL ---
async function loadVocabulary(url) {
  if (!url) {
    wordsData = [];
    createAndDisplayCards(wordsData);
    return;
  }

  // Show a loading message
  tableCardsContainer.innerHTML = '<p>Loading vocabulary...</p>';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const csvText = await response.text();
    const loadedWords = parseCSV(csvText);

    if (loadedWords.length >= MIN_WORDS_FOR_GRID) {
      wordsData = loadedWords;
      alert(`Loaded ${wordsData.length} words. Displaying 25 random cards.`);
      createAndDisplayCards(wordsData); // Display cards from the newly loaded data
    } else {
      throw new Error(`Vocabulary must contain at least ${MIN_WORDS_FOR_GRID} word pairs. Loaded ${loadedWords.length}.`);
    }
  } catch (error) {
    alert('Error loading vocabulary: ' + error.message);
    console.error("Loading Error:", error);
    wordsData = [];
    createAndDisplayCards(wordsData); // Clear the grid on error
  }
}

// --- 4. NEW: EVENT LISTENER FOR THE DROPDOWN ---
vocabularySelector.addEventListener('change', (event) => {
  const selectedUrl = event.target.value;
  loadVocabulary(selectedUrl);
});


// --- EVENT LISTENER FOR RELOAD BUTTON (Slightly modified) ---
reloadWordsButton.addEventListener('click', function() {
  if (wordsData.length < MIN_WORDS_FOR_GRID) {
    alert("Please select and load a valid vocabulary first.");
    return;
  }
  // Shuffle the current wordsData and display 25 cards
  createAndDisplayCards(wordsData);
});

// --- 5. MODIFIED: INITIAL PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  // Populate the dropdown from the vocabularies object
  for (const key in vocabularies) {
    const option = document.createElement('option');
    option.value = vocabularies[key].url;
    option.textContent = vocabularies[key].name;
    vocabularySelector.appendChild(option);
  }

  // Initial display is empty until user selects a vocabulary
  createAndDisplayCards([]);
});

// --- REMOVED: The old file input event listener has been completely removed. ---
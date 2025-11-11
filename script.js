// --- 1. GET HTML ELEMENTS ---
const tableCardsContainer = document.getElementById('tableCards');
const vocabularySelector = document.getElementById('vocabularySelector');
const reloadWordsButton = document.getElementById('reloadWordsButton');
const speakButton = document.getElementById('speakButton');

// --- 2. DEFINE YOUR VOCABULARIES ---
const vocabularies = {
  "default": { name: "Select a vocabulary...", url: "" },
  "hungarian-common-words": { name: "Hungarian common words", url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/hungarian-common-words.csv" },
  "italian-common-nouns": { name: "Italian common nouns", url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/italian_common_nouns.csv" },
  "italian-numerals": { name: "Italian numerals", url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/italian_numerals.csv" },
  "italian-irr-verbs": { name: "Italian irregular verbs", url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/italian_irregular_verbs_conj.csv" },
  "italian-introductory": { name: "Italian introductory words", url: "https://raw.githubusercontent.com/rgusarev/igen_irtem/refs/heads/main/italian_introductory_words.csv" }
};

// --- GLOBAL VARIABLES ---
let wordsData = [];
let lastClickedCard = null;
let italianColumnIndex = -1; // NEW: To store which column (0 or 1) is Italian. -1 means not found.
const MIN_WORDS_FOR_GRID = 25;

// --- UTILITY FUNCTIONS ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- MODIFIED CSV PARSER ---
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 1) {
    return { words: [], italianIndex: -1 }; // File is empty
  }

  // 1. Parse the header row to find the languages
  const headerLine = lines[0];
  const headerCells = headerLine.split(',').map(cell => cell.trim().toLowerCase());

  let foundItalianIndex = -1;
  if (headerCells.length === 2) {
    if (headerCells[0].includes('italian')) {
      foundItalianIndex = 0;
    } else if (headerCells[1].includes('italian')) {
      foundItalianIndex = 1;
    }
  }

  // 2. Determine which lines are data lines (all lines after the first)
  const wordLines = lines.slice(1);
  const wordsArray = [];
  for (const line of wordLines) {
    const cells = line.split(',').map(cell => cell.trim());
    if (cells.length === 2 && cells[0] && cells[1]) {
      wordsArray.push(cells);
    }
  }

  // If no words were found, check if the first line was actually data
  if (wordsArray.length === 0 && lines.length > 0) {
    const firstLineCells = lines[0].split(',').map(cell => cell.trim());
    if (firstLineCells.length === 2 && firstLineCells[0] && firstLineCells[1]) {
      wordsArray.push(firstLineCells);
      // also parse all other lines
      for (let i = 1; i < lines.length; i++) {
        const dataCells = lines[i].split(',').map(cell => cell.trim());
        if (dataCells.length === 2 && dataCells[0] && dataCells[1]) {
          wordsArray.push(dataCells);
        }
      }
    }
  }

  // Return both the words and the index of the Italian column
  return { words: wordsArray, italianIndex: foundItalianIndex };
}

// --- CORE FUNCTIONS ---
function createAndDisplayCards(wordsToDisplay) {
  tableCardsContainer.innerHTML = '';
  lastClickedCard = null;
  if (!wordsToDisplay || wordsToDisplay.length === 0) {
    tableCardsContainer.innerHTML = '<p>No words available. Please select a vocabulary.</p>';
    return;
  }

  const shuffledWords = shuffleArray([...wordsToDisplay]);
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
      const backFace = document.createElement('div');
      backFace.className = 'face back';

      // --- MODIFIED: Logic to decide which word goes on the front face ---
      const pair = shuffledWords[count];
      let frontWord, backWord;

      if (italianColumnIndex === 0) {
        // Italian is in the first column, so show the second (non-Italian) column first.
        frontWord = pair[1];
        backWord = pair[0];
      } else if (italianColumnIndex === 1) {
        // Italian is in the second column, so show the first (non-Italian) column first.
        frontWord = pair[0];
        backWord = pair[1];
      } else {
        // Default behavior if "Italian" is not in the header: show the first column.
        frontWord = pair[0];
        backWord = pair[1];
      }

      frontFace.innerHTML = frontWord;
      backFace.innerHTML = backWord;
      // --- End of modification ---

      flipCardDiv.appendChild(frontFace);
      flipCardDiv.appendChild(backFace);
      cardDiv.appendChild(flipCardDiv);

      cardDiv.addEventListener('click', () => {
        if (lastClickedCard) lastClickedCard.classList.remove('selected');
        cardDiv.classList.add('selected');
        lastClickedCard = cardDiv;
        flipCardDiv.classList.toggle('flipped');
      });

      row.appendChild(cardDiv);
      count++;
    }
    tableCardsContainer.appendChild(row);
    if (count >= shuffledWords.length || count >= MIN_WORDS_FOR_GRID) break;
  }
}

// --- MODIFIED: Load function to handle new parser output ---
async function loadVocabulary(url) {
  if (!url) {
    wordsData = [];
    italianColumnIndex = -1;
    createAndDisplayCards(wordsData);
    return;
  }
  tableCardsContainer.innerHTML = '<p>Loading vocabulary...</p>';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
    const csvText = await response.text();

    const vocabularyData = parseCSV(csvText); // Get the object from the parser
    const loadedWords = vocabularyData.words;
    italianColumnIndex = vocabularyData.italianIndex; // Set the global variable

    if (loadedWords.length >= MIN_WORDS_FOR_GRID) {
      wordsData = loadedWords;
      createAndDisplayCards(wordsData);
    } else {
      throw new Error(`Vocabulary must contain at least ${MIN_WORDS_FOR_GRID} word pairs. Loaded ${loadedWords.length}.`);
    }
  } catch (error) {
    alert('Error loading vocabulary: ' + error.message);
    console.error("Loading Error:", error);
    wordsData = [];
    italianColumnIndex = -1;
    createAndDisplayCards(wordsData);
  }
}

// --- EVENT LISTENERS (Unchanged) ---
vocabularySelector.addEventListener('change', (event) => {
  loadVocabulary(event.target.value);
});

reloadWordsButton.addEventListener('click', function() {
  if (wordsData.length < MIN_WORDS_FOR_GRID) {
    alert("Please select and load a valid vocabulary first.");
    return;
  }
  createAndDisplayCards(wordsData);
});

speakButton.addEventListener('click', () => {
  if (!lastClickedCard) {
    alert('Please click on a card first to select a word to speak.');
    return;
  }
  if ('speechSynthesis' in window) {
    const flipCard = lastClickedCard.querySelector('.flipCard');
    const isFlipped = flipCard.classList.contains('flipped');
    const visibleFace = isFlipped ? flipCard.querySelector('.face.back') : flipCard.querySelector('.face.front');
    const textToSpeak = visibleFace.innerText;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'it-IT';
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Sorry, your browser does not support the text-to-speech feature.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  for (const key in vocabularies) {
    const option = document.createElement('option');
    option.value = vocabularies[key].url;
    option.textContent = vocabularies[key].name;
    vocabularySelector.appendChild(option);
  }
  createAndDisplayCards([]);
});
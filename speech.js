// Wait for the document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Find all the elements on the page with the class "speakable"
    const wordsToSpeak = document.querySelectorAll('.speakable');

    // Loop through each of these elements
    wordsToSpeak.forEach(wordElement => {

        // Add a click event listener to each one
        wordElement.addEventListener('click', () => {
            
            // Get the text content from the element that was clicked
            const text = wordElement.textContent;

            // 1. Create a new "utterance" object. This holds the text and settings.
            const utterance = new SpeechSynthesisUtterance(text);

            // 2. Set the language. This is the MOST IMPORTANT step.
            //    The 'it-IT' code is for Italian.
            utterance.lang = 'it-IT';

            // (Optional) You can also adjust the speed and pitch
            utterance.rate = 0.9; // Make it slightly slower for clarity
            utterance.pitch = 1;  // From 0 to 2

            // 3. Tell the browser's speech synthesis engine to speak it.
            window.speechSynthesis.speak(utterance);
        });
    });
});
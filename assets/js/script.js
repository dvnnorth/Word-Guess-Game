/* Creating class Dictionary to generate a Dictionary object which will store
   and object consisiting of word / definition pairs. Expects an object consisting
   of word / definition pairs and creates methods to get a new random word and to 
   pull the definition of any given word */
class Dictionary {
    constructor(dictionaryObject) {
        this.dictionary = dictionaryObject;
    }
    newWord () {
        let words = Object.keys(this.dictionary);
        return words[ words.length * Math.random() << 0].toUpperCase();
    }

    getDefinition(word) {
        return this.dictionary[(word.toLowerCase())];
    }
}

/* Function that edits the inner HTML of a given ul element to add
    li elements that represent the letters of the word to be revealed
    those li elements have the class letter which underlines them
    via the border-bottom property and also contain a span with the
    letter that uses the Bootstrap class invisible to hide it until
    it is latter guessed correctly and revealed by removing that class */
function createBlanks (word, containerULElement) {
    for (let i = 0; i < word.length; i++) {
        containerULElement.innerHTML += "<li class=\"list-inline-item letter\"><span class=\"invisible\" id=\"letter" + i + "\">" + (word[i] != ' ' ? word[i] : "&nbsp;") + "</span></li>";
    }
}

function clearDisplay () {
    document.getElementById("word-to-be-guessed").innerHTML = "";
    document.getElementById("strikes").innerHTML = "";
}

/*  Create a function that runs the game. runGame expects a callback that will be executed
    once the dictionary data has been loaded from the remote server; that callback will
    actually execute the game logic.
    Using XMLHttpRequest to download and parse the dictionary from repository
    https://github.com/matthewreagan/WebstersEnglishDictionary
    (JSON file based on Websters Unabridged English Dictionary on Project Gutenberg)
    Used information from 
    https://www.w3schools.com/js/js_json_parse.asp
    https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    https://gist.github.com/thiagodebastos/08ea551b97892d585f17 */
function loadGame (callback) {
    const xmlReq = new XMLHttpRequest();
    let progressContainer = document.getElementById("prog-container");
    xmlReq.overrideMimeType("application/json");
    xmlReq.open("GET", "https://raw.githubusercontent.com/matthewreagan/WebstersEnglishDictionary/master/dictionary.json", true);
    xmlReq.onreadystatechange = function () {
        if (xmlReq.readyState == 4 && xmlReq.status == "200") {
            progressContainer.classList.add("d-none");
            callback(xmlReq.responseText);
        }
    }
    xmlReq.send(null);

}

/* Function keyAppears() checks if a given key appears in a given word 
   and returns an object that containswhether or not the letter appears
   and an array of indices at which the letter appears*/
function keyAppears (key, currentWord) {
    key = key.toUpperCase();
    let appearsOrNot = currentWord.includes(key);
    let appearsAt = [];
    if (appearsOrNot) {
        for (let i = 0; i < currentWord.length; i++) {
            // set appearsIndex to indexOf key at substring starting with index i
            let appearsIndex = currentWord.indexOf(key, i);
            // if appearsIndex >= 0 (meaning it does appear beyond this point)
            if (appearsIndex >= 0) {
                appearsAt.push(appearsIndex);
                i = appearsIndex;
            }
            else if (appearsIndex === -1) {
                i = currentWord.length;
            }
        }
    }
    return {appears: appearsOrNot, indices: appearsAt};
}

/* Function revealLetters is a helper function that reveals the letters in the 
   ul#word-to-be-guessed at given indices */
function revealLetters (appearances) {
    for (let i = 0; i < appearances.length; i++) {
        document.getElementById("letter" + appearances[i]).classList.remove("invisible");
    }
}

// Quick show all helper function to ensure createBlanks is working
function showHideLetters(parentElement) {
    if (document.getElementById("letter0").classList.contains("invisible")) {
        for (let i = 1; i <= parentElement.childElementCount; i++) {
            document.getElementById("letter" + (i - 1)).classList.remove("invisible");
        }
    }
    else {
        for (let i = 1; i <= parentElement.childElementCount; i++) {
            document.getElementById("letter" + (i - 1)).classList.add("invisible");
        }
    }
}

/* Function revealBottomDisplay that reveals the bottom row which will contain
   different elements for user input (difficulty, restart game) */
function revealBottomDisplay () {
    document.getElementById("bottom-display").classList.remove("d-none");
}

/* Function hideBottomDisplay that just hides the bottom display area */
function hideBottomDisplay () {
    document.getElementById("bottom-display").classList.add("d-none");
}

/* Function writeDefinition makes the innerHTML of p#definition contain the definition
   from the current dictionary */
function writeDefinition (definition) {
    document.getElementById("definition").innerHTML = definition;
}

function gameLogic(response) {

    // Declare game variables
    
    /* dictionaryFile is the parsed object from the remote JSON file given
       by the parameter response (the xmlReq.responseText from runGame function) */
    const dictionaryFile = JSON.parse(response);
    /* gameDict is the Dictionary object from which we will pull words and definitions */
    const gameDict = new Dictionary(dictionaryFile);
    /* word will be the variable in which we store the word string to be guessed */
    let word;
    let usedKeys = [];
    let strikes = 0;
    
    // Set the word to be guessed to a new word from the game dictionary
    word = gameDict.newWord();
    
    // Write out the blanks (the lis that contain the letters made invisible)
    createBlanks(word, document.getElementById("word-to-be-guessed"));
    
    // Write out the definition in p#definition
    // do this on win or loss writeDefinition(gameDict.getDefinition(word));

    /* Clone body to get rid of previous keyup event listeners */
    /* Got this little hack that saved my game from 
    https://stackoverflow.com/questions/19469881/remove-all-event-listeners-of-specific-type?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa */
    let htmlBody = document.getElementById("pageBody"), bodyClone = htmlBody.cloneNode(true);
    htmlBody.parentElement.replaceChild(bodyClone, htmlBody);

    /* Putting all event listeners here in the logic so that they're reset when the game resets */

    /* Create key listener that uses keyAppears to determine key appearance. 
       If it appears, add the key to usedKeys and then reveal all instances
       of the key. If not, increment strikes
       
       appearance is an object returned by keyAppears that contains whether or not the 
       key appears as a boolean (appearance.appears) and an array of indices at which
       the given key appears (appearance.indices)
       */
    document.body.addEventListener("keyup", function(event) {
        let appearance = keyAppears(event.key, word);
        if (appearance.appears) {
            revealLetters(appearance.indices);
        }
        else {
            strikes++;
            document.getElementById("strikes").innerHTML = strikes;
        }
    });

    document.getElementById("play-again").addEventListener("click", function () {
        clearDisplay();
        loadGame(gameLogic);
    });
    
    // Show helper; for debugging, delete for publishing
    document.getElementById("showHideButton").addEventListener("click", function () {
        showHideLetters(document.getElementById("word-to-be-guessed"));
    });
    
    // Show bottom display helper; for debuggin, delete for publishing
    document.getElementById("showBottom").addEventListener("click", function () {
        if (document.getElementById("bottom-display").classList.contains("d-none")) {
            revealBottomDisplay();
        }
        else {
            hideBottomDisplay();
        }
    });

}

window.onload = function () {

    // Running game, callback function is gameLogic
    clearDisplay();
    loadGame(gameLogic);

}
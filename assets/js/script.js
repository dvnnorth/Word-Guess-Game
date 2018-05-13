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
        return words[ words.length * Math.random() << 0];
    }

    getDefinition(word) {
        return this.dictionary[word];
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

// Quick show all helper function to ensure createBlanks is working
function showAll(parentElement) {
    console.log("running showAll");
    for (let i = 1; i <= parentElement.childElementCount; i++) {
        console.log("id: letter" + (i -  1));
        document.getElementById("letter" + (i - 1)).classList.remove("invisible");
    }
}

/*  Create a function that runs the game. runGame expects a callback that will be executed
    once the dictionary data has been loaded from the remote server; that callback will
    actually execute the game logic.
    Using XMLHttpRequest to download and parse the dictionary from repository
    https://github.com/adambom/dictionary
    Used information from 
    https://www.w3schools.com/js/js_json_parse.asp
    https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    https://gist.github.com/thiagodebastos/08ea551b97892d585f17 */
function runGame (callback) {
    const xmlReq = new XMLHttpRequest();
    xmlReq.overrideMimeType("application/json");
    xmlReq.open("GET", "https://raw.githubusercontent.com/adambom/dictionary/master/dictionary.json", true);
    xmlReq.onreadystatechange = function () {
        if (xmlReq.readyState == 4 && xmlReq.status == "200") {
            callback(xmlReq.responseText);
        }
    }
    xmlReq.send(null);
}

window.onload = function () {

    // Running game, callback function is anonymous function with game logic
    runGame(function (response) {

        // Declare game variables
        
        /* dictionaryFile is the parsed object from the remote JSON file given
           by the parameter response (the xmlReq.responseText from runGame function) */
        const dictionaryFile = JSON.parse(response);
        /* gameDict is the Dictionary object from which we will pull words and definitions */
        const gameDict = new Dictionary(dictionaryFile);
        /* word will be the variable in which we store the word string to be guessed */
        let word;
        
        word = gameDict.newWord();
        createBlanks(word, document.getElementById("word-to-be-guessed"));
        
        // Show/Hide helper; for debugging, delete after publish
        document.getElementById("showButton").addEventListener("click", function () {
            showAll(document.getElementById("word-to-be-guessed"));
        });
    });

};
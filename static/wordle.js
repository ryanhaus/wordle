// Wordle game class
class WordleGame
{
    // set member variables
    constructor(word, gameBoard)
    {
        this.word = word;
        this.board = gameBoard;
        this.active = true;
    }

    // attempts a guess and adds it to the board
    tryGuess(word, row)
    {
        word = word.toLowerCase();

        if (word == this.word) // win!
            alert("win");

        for (let i = 0; i < 5; i++) // go through each letter
        {
            row.children[i].style.backgroundColor = "3a3a3c"; // default set it to gray
            if (this.word.indexOf(word[i]) != -1) row.children[i].style.backgroundColor = "b59f3b"; // if in the word but in the wrong place then set it to yellow
            if (word[i] == this.word[i]) row.children[i].style.backgroundColor = "538d4e"; // if in the word in the right place then set it to green
        }
    }
}

// will be set later, global variables
let currentRow = 0, currentlyTyped = "";
let gameCount = 0, allowedGuesses = 0;
let games = []; // list of games

document.addEventListener("DOMContentLoaded", (ev) => {
    gameCount = document.getElementById("boards").childElementCount, // get number of games
    allowedGuesses = document.getElementById("game-board-0").childElementCount; // get number of allowed guesses

    for (let i = 0; i < gameCount; i++) // fill game list
        games[i] = new WordleGame(document.getElementById("wordslist").children[i].innerText, document.getElementById("boards").children[i]);
});

// determines if something is a letter
function isLetter(s)
{
    return s.length == 1 && s.toUpperCase() != s.toLowerCase();
}

// make HTTP GET request
function httpGet(url)
{
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false); 
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

// handle letter input
function handleKeypress(letter)
{
    if (isLetter(letter))
    {
        if (currentlyTyped.length < 5) // if the string is not max length
            currentlyTyped += letter; // append string
    }
    else // if not a letter
        switch(letter)
        {
            case "GO":
                if (currentlyTyped.length == 5) // if full word
                {
                    if (!JSON.parse(httpGet(`/verify/${currentlyTyped.toLowerCase()}`)).isWord)
                    {
                        alert("Not a word");
                        break; // if it isn't a word don't continue
                    }

                    for (let i = 0; i < gameCount; i++) // go through each word
                        games[i].tryGuess(currentlyTyped, games[i].board.children[currentRow]); // try word

                    // reset typed and increase row
                    currentlyTyped = "";
                    currentRow++;
                }
                break;
            case "<":
                if (currentlyTyped.length > 0) // if more than zero characters
                    currentlyTyped = currentlyTyped.substring(0, currentlyTyped.length - 1); // backspace
                break;
        }
        
    for (let i = 0; i < 5; i++) // for each letter
        for (let j = 0; j < gameCount; j++) // go through each game
            if (games[j].active)
                games[j].board.children[currentRow].children[i].innerText = currentlyTyped[i] == undefined ? "" : currentlyTyped[i]; // display
}

// actual keyboard input
document.addEventListener("keydown", (e) => {
    if (isLetter(e.key)) // check if e.key is a letter
        handleKeypress(e.key.toUpperCase()); // handle event
    else // if not substitute for other possible keys
        switch(e.key.toUpperCase())
        {
            case "ENTER":
                handleKeypress("GO");
                break;
            case "BACKSPACE":
                handleKeypress("<");
                break;
        }
});
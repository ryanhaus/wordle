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
    tryGuess(_word, row)
    {
        let word = _word.toLowerCase();

        if (word == this.word) // win!
            this.active = false; // make sure future guesses don't get written here

        let colors = [];
        let letterCounts = {};

        for (let i = 0; i < 5; i++) // go through each letter
        {
            if (letterCounts[word[i]] == undefined) letterCounts[word[i]] = 0; // if not already documented make it zero

            letterCounts[this.word[i]]++; // change letter counts
            colors[i] = "gray"; // default gray
        }

        for (let i = 0; i < 5; i++) // go through each letter
            if (this.word[i] == word[i]) // if green
            {
                letterCounts[word[i]]--; // decrease letter count
                colors[i] = "green"; // set to green
            }

        for (let i = 0; i < 5; i++) // go through each letter
        {
            if (letterCounts[word[i]] >= 1 && colors[i] == "gray") // if letter is present in another place
            {
                letterCounts[word[i]]--; // decrease count
                colors[i] = "yellow"; // set to yellow
            }

            setTimeout(() => {
                row.children[i].classList.add(`switch_${colors[i]}`);
            }, 100 * i);
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
                        if (games[i].active)
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
            {
                let target = games[j].board.children[currentRow].children[i];
                target.innerText = currentlyTyped[i] == undefined ? "" : currentlyTyped[i]; // display
                
                if (i == currentlyTyped.length - 1 && letter != "<")
                {
                    target.classList.add("typing");
                    setTimeout(() => {
                        target.classList.remove("typing");
                    }, 200);
                }
            }
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

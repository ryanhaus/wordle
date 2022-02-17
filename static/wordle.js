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
            if (letterCounts[this.word[i]] == undefined) letterCounts[this.word[i]] = 0; // if not already documented make it zero

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

            row.children[i].setAttribute("block-color", colors[i]);

            setTimeout(() => {
                row.children[i].classList.add(`switch_${colors[i]}`);
            }, 100 * i);
        }

        update_keyboard_colors(); // update the keyboard colors
    }

    // do invalid word animation
    invalidWordAnim(row)
    {
        const parent = this.board.children[row].children;
        for (let i = 0; i < parent.length; i++) // go through each letter
        {
            parent[i].classList.add("invalid_word"); // add animation class

            setTimeout(() => {
                parent[i].classList.remove("invalid_word");
            }, 500);
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

// verifies inputs of the board changing function
function verifyForm()
{
    if (document.getElementById("boardNumber").value % 2 == 1) // if number is odd
    {
        alert(`Board number must be a multiple of 2, is currently ${document.getElementById("boardNumber").value}`);
        return false; // not good
    }

    return true; // good to submit
}

// make HTTP GET request
function httpGet(url)
{
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("POST", url, false); 
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
                        // not a word, do animation
                        for (const i in games)
                            games[i].invalidWordAnim(currentRow);

                        break; // if it isn't a word don't continue
                    }

                    for (const i in games) // go through each word
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
                
                if (i == currentlyTyped.length - 1 && letter != "<" && letter != "GO")
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

const colorMap = { "gray": "#3a3a3c", "yellow": "#b59f3b", "green": "#538d4e" };

function update_keyboard_colors(boardID = document.getElementById("focused_board_select").value)
{
    document.getElementById("focused_board_select").value = boardID; // update dropdown value

    const letters = "qwertyuiopasdfghjklzxcvbnm".split("");

    for (let i = 0; i < letters.length; i++)
    {
        let target = document.getElementById(`key-${letters[i].toUpperCase()}`);
        target.style.backgroundColor = "#121213";
        target.style.borderColor = "#3a3a3c";
        target.setAttribute("block-color", "gray");
    }

    const board = games[boardID].board;
    for (let i = 0; i < board.childElementCount; i++)
        for (let j = 0; j < board.children[i].childElementCount; j++)
        {
            let
                target = board.children[i].children[j],
                color = target.getAttribute("block-color"),
                target_key = document.getElementById(`key-${target.innerText.toUpperCase()}`);
            
            if (target_key == undefined) continue;
            let key_color = target_key.getAttribute("block-color");

            if (key_color == "gray" || (key_color == "yellow" && color == "green"))
            {
                target_key.style.backgroundColor = colorMap[color];
                target_key.style.borderColor = colorMap[color];
            }
        }
}

const express = require("express");
const fs = require("fs");

// load words lists
const wlist = JSON.parse(fs.readFileSync("./words.json"));

// express app setup
const app = express();
app.use("/static", express.static("static")); // for static files
app.set("view engine", "pug"); // using pug as views engine

// handle request
app.get("/play/:mode", (req, res) => {
    // fill default values if necessary
    if (req.query.boardCount == undefined) req.query.boardCount = 1;
    if (req.query.rowCount == undefined) req.query.rowCount = 6;

    switch(req.params.mode)
    {
    case "unlimited":
        // create list of random words
        let words = [];
        while (words.length < req.query.boardCount)
        {
            let entry = wlist.words[Math.round(Math.random() * wlist.words.length) % wlist.words.length]; // get random word
            if (words.indexOf(entry) == -1) // if not already used
                words.push(entry); // add to list
        }

        res.render("game", { config: req.query, words: words, mode: "Unlimited", words_json: JSON.stringify(wlist) }); // serve file using url query
    break;

    case "daily":
        res.render("game", { config: req.query, words: getTodaysWords(req.query.boardCount), mode: "Daily", words_json: JSON.stringify(wlist) }); // serve file using url query

    	break;
    }
});

// handle default request
app.get("/", (req, res) => {
    res.redirect("/play/daily?boardCount=8&rowCount=15"); // auto redirect to 1 board of 5x6
});

// daily wordle
app.get("/daily", (req, res) => {

});

app.listen(process.env.PORT || 3000); // start server

// random functions: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
// seed function (hash)
function xmur3(str)
{
    for (let i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }

    return function()
    {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function sfc32(a, b, c, d)
{
    return function()
    {
        a >>>= 0; b >>>= 0; c>>>= 0; d >>>= 0;
        let t = (a + b) | 0;

        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        
        return (t >>> 0) / 4294967296;
    }
}

// date functions
function getUTCToday()
{
    let d = new Date(); // todays date
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); // only care about month day and year
}

function getTodaysWords(count)
{
    let
        seed = xmur3(getUTCToday().toISOString()), // generate seed for today
        rand = sfc32(seed, seed, seed, seed); // generate random function
    
    let words_list = [];
    while (words_list.length < count) // repeat until the words list is filled
    {
        let selected_word = wlist.words[Math.floor(rand() * Number.MAX_SAFE_INTEGER) % wlist.words.length]; // select a word

        if (words_list.indexOf(selected_word) == -1) // if not already in list
            words_list.push(selected_word); // add word
        // if not, go back through and try again
    }

    return words_list;
}

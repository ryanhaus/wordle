const express = require("express");
const fs = require("fs");

// load words lists
const wlist = JSON.parse(fs.readFileSync("./words.json"));

// express app setup
const app = express();
app.use("/static", express.static("static")); // for static files
app.set("view engine", "pug"); // using pug as views engine

// handle request
app.get("/play", (req, res) => {
    // fill default values if necessary
    if (req.query.boardCount == undefined) req.query.boardCount = 1;
    if (req.query.rowCount == undefined) req.query.rowCount = 6;

    // create list of random words
    let words = [];
    while (words.length < req.query.boardCount)
    {
        let entry = wlist.words[Math.round(Math.random() * wlist.words.length) % wlist.words.length]; // get random word
        if (words.indexOf(entry) == -1) // if not already used
            words.push(entry); // add to list
    }

    res.render("game", { config: req.query, words: words }); // serve file using url query
});

// verify word
app.post("/verify/:word", (req, res) => {
    res.send(JSON.stringify({ isWord: wlist.possible.indexOf(req.params.word.toLowerCase()) != -1 || wlist.words.indexOf(req.params.word.toLowerCase()) != -1 }));
});

// handle default request
app.get("/", (req, res) => {
    res.redirect("/play?boardCount=8&rowCount=15"); // auto redirect to 1 board of 5x6
});

app.listen(process.env.PORT || 3000); // start server
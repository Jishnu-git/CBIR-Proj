const express = require('express');
const pos = require("pos");

const app = express();
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();

app.use(express.json());
app.use(express.static("./"));

app.post("/postag/", (req, res) => {
    const text = req.body.text;
    const words = lexer.lex(text);
    const taggedWords = tagger.tag(words);
    console.log(taggedWords);
    res.send(taggedWords);   
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
})



const express = require('express');
const pos = require("pos");
const fs = require('fs');
const { json } = require('express');

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
function getRandom(min,max){
    return (Math.random() * (max - min + 1) ) + min;
}
function getRandomInt(min,max){
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
app.listen(3000, () => {
    console.log("Listening on port 3000");
});

function generateDataset() {
    var data = [];
    for (let i = 0; i < 1000; i++) {
        let main_x = getRandom(0,500);
        let main_y = getRandom(0,500);
        let main_height = getRandomInt(0,100)
        let main_width = getRandomInt(0,100)
        let shape_x = getRandom(0,500);
        let shape_y = getRandom(0,500);
        let shape_height = getRandomInt(0,100)
        let shape_width = getRandomInt(0,100)
        let position;
        var distance_x = main_x - shape_x;
        var distance_y = main_y - shape_y;
        if(distance_x < (main_width/2 + shape_width/2)  && distance_y < (main_height/2 + shape_height/2)){
            position = "inside or infront"
        }else if(Math.abs(distance_x) > (main_width/2 + shape_width/2) && Math.abs(distance_y) <= (main_height/2 + shape_height/2)){
            if(distance_x > 0)
                position ="left";
            else
                position="right";
        }else if(Math.abs(distance_x) <= (main_width/2 + shape_width/2) && Math.abs(distance_y) > (main_height/2 + shape_height/2)){
            if(distance_x > 0)
                position ="above";
            else
                position="below";
        }
        var obj = {'main_x':main_x,'main_y':main_y,'main_height':main_height,'main_width':main_width,'shape_height':shape_height,'shape_width':shape_width,'shape_x':shape_x,'shape_y':shape_y,'position':position};
        data.push(obj);
    }
    fs.writeFileSync('data.json',JSON.stringify(data),function(err){
        console.log(err);
    })
}



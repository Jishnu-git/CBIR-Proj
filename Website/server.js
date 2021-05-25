const express = require('express');
const pos = require("pos");
const fs = require('fs');
const { json } = require('express');

const tf = require('@tensorflow/tfjs-node');

const app = express();
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();
var genModel =false;
var model;

app.use(express.json());
app.use(express.static("Src"));

app.post("/postag/", (req, res) => {
    const text = req.body.text;
    const words = lexer.lex(text);
    const taggedWords = tagger.tag(words);
    console.log(taggedWords);
    res.send(taggedWords);   
})

app.post("/loadModel",(req,res)=>{
    while(!genModel);
    res.send("Loaded");
});

app.post("/predict",(req,res)=>{
    console.log(req.body);
    position = predictPos(req.body.input);
    res.send(JSON.stringify(position));
})

app.listen(3000, () => {
    setLexicon(directionalWords);
    console.log("Listening on port 3000");
    loadGeneratorModel();
    //generateDatasetFile();
});


//Helper Functions for NN Models
function getRandom(min,max){
    return (Math.random() * (max - min + 1) ) + min;
}
function getRandomInt(min,max){
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

//Functions for Loading and Running NN Model
async function loadGeneratorModel(){
    model = await tf.loadLayersModel('file://Src/Models/PosititionGeneration.json');
    console.log("Generator Loaded");
    genModel = true;
}
function predictPos(input){
    if(!genModel){
        console.log("Model Not loaded");
    }
    let position = input[input.length - 1];
    input[input.length - 1] = oneHotEncode(position);
    console.log(input.flat());
    input = input.flat()
    input = tf.tensor2d(input, [1, input.length])
    const predicted = model.predict(input)
    var output = {
        x : predicted.arraySync()[0][0],
        y: predicted.arraySync()[0][1]
    }
    return output; 
}

function oneHotEncode(position){
    //One Hot Encoding Directions 
    let top = 0; 
    // 0 for inactive 1 for active
    let bottom = 0;
    let left = 0;
    let right = 0;
    let topRight = 0;
    let bottomRight = 0;
    let topLeft = 0;
    let bottomLeft = 0;

    switch(position){
        case'top left':
            topLeft = 1
            break;
        case'top right':
            topRight = 1;
            break;
        case'top':
            top = 1;
            break;
        case'bottom':
            bottom = 1;
            break;
        case'right':
            right = 1;
            break;
        case'left':
            left = 1;
            break;
        case'bottom left':
            bottomLeft = 1
            break;
        case'bottom right':
            bottomRight = 1
            break;
        default:
            console.error("Incorrect Position");
            return;
    }
return [top, bottom, right, left, topLeft, topRight, bottomLeft, bottomRight];
}

//Functions for Dataset Creation for training the model
function generateDatasetFile() {
    var data = generateSpecData();
    var file = fs.createWriteStream("Src/Datasets/disc_data1.json",{flags:'a'})
    file.write(JSON.stringify(data) + '\n');
    file.end();
    file.close();
    console.log("Done");
}

function generateSpecData(){
    var data = []
    var positions = ['top left','top right', 'top', 'bottom', 'right', 'left','bottom left','bottom right'];
    positions.forEach(position => {
        for (let i = 0; i < 1000; i++) {
            let main_x = getRandom(0,300);
            let main_y = getRandom(0,300);
            let main_width = getRandomInt(0,100);
            let main_height = getRandomInt(0,100);
            let shape_height = getRandomInt(0,100);
            let shape_width = getRandomInt(0,100);
            let data_position = position;
            let shape_x;
            let shape_y;
            switch(position){
                case'top left':
                    shape_x = main_x - (shape_width + main_width + getRandom(0,20));
                    shape_y = main_y - (shape_height + main_height + getRandom(0,20));
                    break;
                case'top right':
                    shape_x = main_x + (shape_width + main_width + getRandom(0,20));
                    shape_y = main_y - (shape_height + main_height + getRandom(0,20));
                    break;
                case'top':
                    shape_x = getRandom(0,main_width);
                    shape_y = main_y - (shape_height + main_height + getRandom(0,20));
                    break;
                case'bottom':
                    shape_x = getRandom(0,main_width);
                    shape_y = main_y + (shape_height + main_height + getRandom(0,20));
                    break;
                case'right':
                    shape_x = main_x + (shape_width + main_width + getRandom(0,20));
                    shape_y = getRandom(0,main_height);
                    break;
                case'left':
                    shape_x = main_x - (shape_width + main_width + getRandom(0,20));
                    shape_y = getRandom(0,main_height);
                    break;
                case'bottom left':
                    shape_x = main_x - (shape_width + main_width + getRandom(0,20));
                    shape_y = main_y + (shape_height + main_height + getRandom(0,20));
                    break;
                case'bottom right':
                    shape_x = main_x + (shape_width + main_width + getRandom(0,20));
                    shape_y = main_y + (shape_height + main_height + getRandom(0,20));
                    break;
                default:
                    console.log("Incorrect position");
                    return;          
            }
            if (shape_x < 0 || shape_y < 0 || shape_x > 300 || shape_y > 300) {
                i--;
                continue;
            }
            var obj = {'main_x':main_x,'main_y':main_y,'main_height':main_height,'main_width':main_width,'shape_height':shape_height,'shape_width':shape_width,'shape_x':shape_x,'shape_y':shape_y, 'position':data_position};
            data.push(obj);
        }
    });
    return data;
}

//Position Helper function
function setLexicon(words, tag = ["DIR"]) {
    for (var word of words) {
        tagger.lexicon[word] = tag;
    }
}

const directionalWords = [
    "right",
    "left",
    "up",
    "down",
    "above",
    "below",
    "under",
    "on",
    "over",
    "front",
    "behind",
    "back",
    "next",
    "side",
    "beside",
    "near"
];



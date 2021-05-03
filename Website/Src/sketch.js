let canvas;
let x, y;
let cwidthRatio = 0.5, cheightRatio = 0.5;
let globalScale = 1;
let xOffset = 0;
let yOffset = 0;
let activeDrawings = [];
let inactiveDrawings = [];
let index = 0;

function setup() {
    canvas = createCanvas(windowWidth * cwidthRatio, windowHeight * cheightRatio);
    background(255);
    x = width / 2;
    y = height / 2;
}

function draw() {
       
}

function processQuery(queryText) {
    let req = new XMLHttpRequest();
    req.open("POST", "/postag/", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const taggedWords = JSON.parse(this.responseText);
            let valid = true;
            let query = "";
            console.log(taggedWords);
            console.log(this.responseText);
            let firstNN;
            for (const taggedWord of taggedWords) {
                if (taggedWord[1] === "NN") {
                    if (models.includes(taggedWord[0])) {
                        query += "<span class=\"green\">"
                    } else {
                        query += "<span class=\"red\">"
                        valid = false;
                    }
                    if (!firstNN) firstNN = taggedWord[0];
                } else if (taggedWord[1] === "DIR") {
                    query += "<span class=\"blue\">"
                } else {
                    query += "<span class=\"gray\">"
                }
                query += taggedWord[0] + "</span> ";
            } 
            document.getElementById("query").innerHTML = query;
            if (valid) {
                startDrawing([firstNN]);
                document.getElementById("error").style.visibility = "hidden";
            } else {
                document.getElementById("error").style.visibility = "visible";
            }            
        }
    }
    req.send(JSON.stringify({text: queryText}));
}

function startDrawing(objects) {
    console.log(objects);
    for (var obj of objects) {
        console.log(obj)
        var drawing = new Drawing(x, y, obj, globalScale);
        activeDrawings.push(drawing);
        drawing.generate(() => drawing.draw(true));
    }
}

function clearCanvas() {
    clear();
    activeDrawings = [];
    document.getElementById("query").innerHTML = "";
    document.getElementById("error").style.visibility = "hidden";
}

function windowResized() {
    globalScale = min(cwidthRatio / 0.9, cheightRatio / 0.75) * 2;
    let newWidth = windowWidth * cwidthRatio;
    let newHeight = windowHeight * cheightRatio;
    resizeCanvas(newWidth, newHeight, true);

    x = width / 2 + xOffset;
    y = height / 2 + yOffset;
    redrawActiveDrawings();
}

function setCanvasWidth(newPercentage) {
    cwidthRatio = newPercentage / 100;
    windowResized();
}

function setCanvasHeight(newPercentage) {
    cheightRatio = newPercentage / 100;
    windowResized();
}
function setXoffset(val){
    xOffset = parseInt(val);
    x = width / 2 + xOffset;
    redrawActiveDrawings();
}
function setYoffset(val){
    yOffset = parseInt(val);
    y = height / 2 + yOffset;
    redrawActiveDrawings();
}
function redrawActiveDrawings() {
    clear();
    for (var drawing of activeDrawings) {
        drawing.setScale(globalScale);
        drawing.setX(x);
        drawing.setY(y);
        drawing.draw();
    }
}

function regenerateActiveDrawings() {
    clear();
    for (var drawing of activeDrawings) {
        drawing.generate(() => drawing.draw(true));
    }
}
let model;
let canvas;
let currentStroke;
let penStatus = "down";
let object = "skull";
let x, y;
let cwidthRatio = 0.5, cheightRatio = 0.5;
let scale = 1;

function setup() {
  canvas = createCanvas(windowWidth * cwidthRatio, windowHeight * cheightRatio);
  background(255);
  x = width / 2;
  y = height / 2;
}

function draw() {
  if (currentStroke) {
      stroke(0);
      strokeWeight(3);

      if (penStatus === "end") {
          return;
      }

      if (penStatus == "down") {
        line(x, y, x + currentStroke.dx * scale, y + currentStroke.dy * scale);
      }
      x += currentStroke.dx * scale;
      y += currentStroke.dy * scale;
      penStatus = currentStroke.pen;
      model.generate(processStroke);
  }     
}

function processStroke(error, strokePath) {
    if (error) {
        console.error(error);
    } else {
        currentStroke = strokePath;
    }
}

function processQuery(queryText) {
    let req = new XMLHttpRequest();
    req.open("POST", "/postag/", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const taggedWords = JSON.parse(this.responseText);
            console.log(taggedWords);
            console.log(this.responseText);
            let firstNN;
            for (const taggedWord of taggedWords) {
                if (taggedWord[1] === "NN") {
                    firstNN = taggedWord[0];
                    break;
                }
            } 
            startDrawing(firstNN);
        }
    }
    req.send(JSON.stringify({text: queryText}));
}

function startDrawing(obj) {
    x = width / 2;
    y = height / 2;
    object = obj;
    
    if (models.includes(object)) {
        model = ml5.sketchRNN(object, () => {
            penStatus = "down";
            model.generate(processStroke)
        });
    } else {
        console.error("Specified object does not have a model!");
    } 
}

function clearCanvas() {
    clear();
}

function windowResized() {
    penStatus = "end";
    currentStroke = null;
    scale = min(cwidthRatio / 0.9, cheightRatio / 0.75);
    let newWidth = windowWidth * cwidthRatio;
    let newHeight = windowHeight * cheightRatio;
    resizeCanvas(newWidth, newHeight, true);

    x = width / 2;
    y = height / 2;
    penStatus = "down";
    model.reset();
    model.generate(processStroke);

}

function setCanvasWidth(newPercentage) {
    cwidthRatio = newPercentage / 100;
    windowResized();
}

function setCanvasHeight(newPercentage) {
    cheightRatio = newPercentage / 100;
    windowResized();
}

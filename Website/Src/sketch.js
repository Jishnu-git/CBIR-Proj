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

function startDrawing(objects) {
    clear();
    activeDrawings = [];
    console.log(objects);
    var objectStatus = new Array(objects.length);
    var centreInd;
    for (var obj of objects) {
        console.log(obj)
        var drawing = new Drawing(x, y, obj.name, globalScale);
        activeDrawings.push(drawing);

        const ind = activeDrawings.length - 1;
        objectStatus[ind] = false;
        if (obj.position === "centre") {
            centreInd = ind;
        }

        drawing.generate().then((boundingBox) => {
            objectStatus[ind] = true
            console.log(boundingBox)
        });
    }
    allReady(objectStatus).then(() => {
        //activeDrawings[centreInd].offsetPos(activeDrawings[centreInd].width() / 2 + xOffset, activeDrawings[centreInd].height() / 2 + yOffset);
        clampScale(activeDrawings[centreInd]);
        for (var i = centreInd - 1; i >= 0; i--) {
            activeDrawings[i].setPos(activeDrawings[i + 1].x, activeDrawings[i + 1].y);
            clampScale(activeDrawings[i]);
            computeOffsets(activeDrawings[i], activeDrawings[i + 1], objects[i].position);
        }

        for (var drawing of activeDrawings) {
            drawing.draw(true);
            const BB = drawing.boundingBox();
            rect(BB.x - (BB.width / 2), BB.y - (BB.height / 2), BB.width, BB.height);
            stroke("red")
            strokeWeight(5);
            point(BB.x, BB.y);
            point(drawing.minX, drawing.minY);
            point(drawing.maxX, drawing.maxY);
            point(drawing.x, drawing.y);
            stroke("black");
            strokeWeight(1);
        }
    })
}

async function allReady(status) {
    while (status.includes(false)) {
        await sleep(50);
    }
    return;
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
    for (var i = 0; i < activeDrawings.length; i++) {
        const ind = i;
        activeDrawings[i].generate(() => activeDrawings[ind].draw(true));
    }
}

function clampScale(drawing) {
    drawing.setScale(1);
    if (drawing.width() >= 0.3 * width || drawing.height() >= 0.3 * height) {
        drawing.setScale(Math.min(0.3 * width / drawing.width(), 0.3 * height / drawing.height()));
    }
}

function computeOffsets(object, focus, position) {
    const focusHalfWidth = focus.width() / 2;
    const objectHalfWidth = object.width() / 2;
    const focusHalfHeight = focus.height() / 2;
    const objectHalfHeight = object.height() / 2;
    switch (position) {
        case "right":
            object.offsetX(Math.floor(Math.random() * width * 0.3) + focusHalfWidth + objectHalfWidth);
            break;
        case "left":
            object.offsetX(-1 * (Math.floor(Math.random() * width * 0.3) + focusHalfWidth + objectHalfWidth));
            break;
        case "down":
            object.offsetY(Math.floor(Math.random() * height * 0.3) + focusHalfHeight + objectHalfHeight);
            break;
        case "up":
            object.offsetY(-1 * (Math.floor(Math.random() * height * 0.3) + focusHalfHeight + objectHalfHeight));
            break;
    }
}
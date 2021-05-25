let canvas;
let x, y;
let cwidthRatio = 0.5, cheightRatio = 0.5;
let globalScale = 1;
let mainObject;
let unmainObjects = [];
let activeDrawings = [];
let generatedDrawing = [];
let mainBoundingBox;
let aligned = false;
let readyCount = 0;
let objectCount = 10;
let offsetX = 0, offsetY = 0;


function setup() {
    canvas = createCanvas(windowWidth * cwidthRatio, windowHeight * cheightRatio);
    // canvas = createCanvas(1000, 500);
    background(255);
    x = width / 2;
    y = height / 2;
    console.log(x,y)
    setXY(width , height);
}
function draw() {
       if(readyCount === objectCount && aligned === false && activeDrawings.length > 0){
           alignObjects();
           console.log(activeDrawings.length);
           aligned = true;
       }
}
function startDrawing(objects){
    activateRun("generateObj");
    console.log(objects);
    objectCount = objects.length;
    activateObj("generateObj");
    objects.map(object => {
        activeDrawings.push({drawing: new Drawing(x,y,object.name,globalScale),position:object.position, status:false})
    })
    activeDrawings.map(activedrawing =>{
        activedrawing.drawing.generate((boundingbox)=>{
            clampScale(activedrawing.drawing);
            let bb = activedrawing.drawing.boundingBox();
            activedrawing.boundingbox = bb;
            activedrawing.status = true;
            readyCount++;
            activateObj();
        })
    })
}

async function alignObjects(){
    activateRun("placeObj");
    console.log(activeDrawings.length);
    const centerDrawing = activeDrawings[activeDrawings.length - 1].drawing;
    let absMinX = centerDrawing.minX,
        absMinY = centerDrawing.minY,
        absMaxX = centerDrawing.maxX,
        absMaxY = centerDrawing.maxY;

    for (let i = activeDrawings.length - 2; i >=0 ; i--) {
        let element = activeDrawings[i];
        element.status = false;
        let objectBB = element.boundingbox;
        let relBB = activeDrawings[i+1].boundingbox;
        console.log(objectBB);
        console.log(relBB);
        const oldCenter = {x:objectBB.x, y:objectBB.y};
        console.log(oldCenter);
        var input = [
            relBB.x/ width,
            relBB.y/ height,
            relBB.height/(0.3 * height),
            relBB.width/(0.3 * width),
            objectBB.height/(0.3 * height),
            objectBB.width/(0.3 * width),
            element.position
        ]
        
        let position = await placeObject(input);
        element.drawing.offsetPos(position.x - oldCenter.x, position.y - oldCenter.y);
        //element.drawing.OffsetY(position.y);
        let boundingBox = await element.drawing.generate();
        element.boundingbox = boundingBox;
        if (absMinX > element.drawing.minX) {
            absMinX = element.drawing.minX;
        }
        if (absMinY > element.drawing.minY) {
            absMinY = element.drawing.minY;
        }
        if (absMaxX < element.drawing.maxX) {
            absMaxX = element.drawing.maxX;
        }
        if (absMaxY < element.drawing.maxY) {
            absMaxY = element.drawing.maxY;
        }

    }
    activateDone("placeObj");
    calculateGlobalOffsets(absMinX, absMinY, absMaxX, absMaxY);
    stroke("red");
    rect(absMinX + offsetX, absMinY + offsetY, absMaxX - absMinX, absMaxY - absMinY);
    console.log({xmin: absMinX, ymin: absMinY, xmax: absMaxX, ymax: absMaxY});
    stroke(0);
    drawActiveDrawings();
}

function calculateGlobalOffsets(minX, minY, maxX, maxY) {
    var fullWidth = maxX - minX;
    var fullHeight = maxY - minY;
    var center = {
        x: (maxX + minX) / 2,
        y: (maxY + minY) / 2
    };
    // if (fullWidth > width || fullHeight > height) {
    //     globalScale = Math.min(width / fullWidth, height / fullHeight);
    //     center.x *= globalScale;
    //     center.y *= globalScale;
    //     fullWidth *= globalScale;
    //     fullHeight *= globalScale;
    // }

    // const scaledMaxX = center.x + (fullWidth / 2);
    // const scaledMinX = center.x - (fullWidth / 2);
    // const scaledMaxY = center.y + (fullHeight / 2);
    // const scaledMinY = center.y - (fullHeight / 2);
    
    // if (scaledMaxX > width) {
    //     offsetX = width - (center.x + (fullWidth / 2));
    // } else if (scaledMinX < 0) {
    //     offsetX = -1 * scaledMinX;
    // } else {
    //     offsetX = 0;
    // }

    // if (scaledMaxY > height) {
    //     offsetY = height - (center.y + (fullHeight / 2));
    // } else if (scaledMinY < 0) {
    //     offsetY = -1 * scaledMinY;
    // } else {
    //     offsetY = 0;
    // }
    console.log(center);
    offsetX = (width / 2) - center.x;
    offsetY = (height / 2) - center.y;
}

function drawActiveDrawings() {
    activateRun("drawingObj");
    activeDrawings.map(element => {
        element.drawing.draw(true, offsetX, offsetY, globalScale);
        //rect(element.drawing.minX, element.drawing.minY, element.drawing.width(), element.drawing.height());
        const BB = element.drawing.boundingBox();
        rect(element.drawing.minX + offsetX, element.drawing.minY + offsetY, BB.width * globalScale, BB.height * globalScale);
    })
}

function regenerateActiveDrawings() {
    clear();
    for (var i = 0; i < activeDrawings.length; i++) {
        const ind = i;
        activeDrawings[i].generate(() => activeDrawings[ind].draw(true));
    }
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
function clearCanvas() {
    clear();
    activeDrawings = [];
    document.getElementById("query").innerHTML = "";
    document.getElementById("error").style.visibility = "hidden";
}
function clampScale(drawing) {
    drawing.setScale(1);
    if (drawing.width() >= 0.3 * width || drawing.height() >= 0.3 * height) {
        drawing.setScale(Math.min(0.3 * width / drawing.width(), 0.3 * height / drawing.height()));
    }
}

function activateRun(element) {
    $("#"+element).css({"color":"black", "border":"1px solid black"});
}

function activateObj() {
    $("#generateObj").text("Generating objects "+readyCount+"/"+objectCount);
}

function activateDone(element) {
    $("#"+element).text("Finished " + $("#"+element).text());
}
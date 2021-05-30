let canvas;
let x, y;
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
let showBoundingBox = false;


function setup() {
    canvas = createCanvas(windowWidth * 0.5, windowHeight * 0.5);
    // canvas = createCanvas(1000, 500);
    background(255);
    x = width / 2;
    y = height / 2;
    console.log(x,y)
    setXY(width , height);
    for (const model of models) {
        $("#listContent").append(
            `<div class="col-12">
                ` + model + `
            </div>`
        );
    }
}
function draw() {
    if(readyCount === objectCount && aligned === false && activeDrawings.length > 0){
        alignObjects();
        console.log(activeDrawings.length);
        aligned = true;
    } else if (!aligned && activeDrawings.length > 0) {
        updateProgress(33 * (readyCount / objectCount), "Generating Objects: " + readyCount + "/" + objectCount);
    }
}
function startDrawing(objects){
    clear();
    activeDrawings = [];
    readyCount = 0;
    aligned = false;
    console.log(objects);
    objectCount = objects.length;
    objects.map(object => {
        activeDrawings.push({drawing: new Drawing(x,y,object.name,1),position:object.position, status:false})
    })
    activeDrawings.map(activedrawing =>{
        activedrawing.drawing.generate((boundingbox)=>{
            clampScale(activedrawing.drawing);
            let bb = activedrawing.drawing.boundingBox();
            activedrawing.boundingbox = bb;
            activedrawing.status = true;
            readyCount++;
        })
    })
}

async function alignObjects(){
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
        updateProgress(33 + (33 * ((activeDrawings.length - i) / activeDrawings.length)), "Running the GAN: " + (activeDrawings.length - i) + "/" + activeDrawings.length);
        element.drawing.offsetPos(position.x - oldCenter.x, position.y - oldCenter.y);
        //element.drawing.OffsetY(position.y);
        let boundingBox = element.drawing.boundingBox();//await element.drawing.generate();
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
    calculateGlobalOffsets(absMinX, absMinY, absMaxX, absMaxY);
    drawActiveDrawings();
}

function calculateGlobalOffsets(minX, minY, maxX, maxY) {
    var center = {
        x: (maxX + minX) / 2,
        y: (maxY + minY) / 2
    };
    
    console.log(center);
    offsetX = (width / 2) - center.x;
    offsetY = (height / 2) - center.y;
}

function drawActiveDrawings() {
    let doneCount = 0;
    let maxLen = 0;
    for (const element of activeDrawings) {
        const drawing = element.drawing;
        if (drawing.strokePath.length > maxLen) {
            maxLen = drawing.strokePath.length;
        }
    }
    activeDrawings.map((element) => {
        element.drawing.draw(true, offsetX, offsetY, globalScale);
        if (showBoundingBox) {
            const BB = element.drawing.boundingBox();
            noFill();
            rect(element.drawing.minX + offsetX, element.drawing.minY + offsetY, BB.width * globalScale, BB.height * globalScale);
        }
    });
    smoothProgress(maxLen, "Drawing...");
}

function regenerateActiveDrawings() {
    clear();
    for (var i = 0; i < activeDrawings.length; i++) {
        const ind = i;
        activeDrawings[i].generate(() => activeDrawings[ind].draw(true));
    }
}
function redrawActiveDrawings(showSteps = true) {
    clear();
    for (var element of activeDrawings) {
        const drawing = element.drawing;
        if (showBoundingBox) {
            noFill();
            rect(drawing.minX + offsetX, drawing.minY + offsetY, drawing.width() * globalScale, drawing.height() * globalScale);
        }
        
        drawing.draw(showSteps, offsetX, offsetY, globalScale);
    }
    
}
function clearCanvas() {
    clear();
    activeDrawings = [];
    readyCount = 0;
    updateProgress(0, "");
    document.getElementById("query").innerHTML = "";
    document.getElementById("error").style.visibility = "hidden";
    document.getElementById("input").value = "";
}
function clampScale(drawing) {
    drawing.setScale(1);
    if (drawing.width() >= 0.3 * width || drawing.height() >= 0.3 * height) {
        drawing.setScale(Math.min(0.3 * width / drawing.width(), 0.3 * height / drawing.height()));
    }
}

function toggleBoundingBox() {
    showBoundingBox = $("#boundingBox").is(":checked")
    if (activeDrawings.length > 0 && aligned) {
        redrawActiveDrawings(false);
    }
}

function updateProgress(progress, text) {
    if (progress == 0) {
        $("#progress").hide();
    } else {
        $("#progress").show();
    }
    $("#progress").width(progress + "%");
    if (progress == 100) {
        $("#progressText").text("Done (100%)");
    } else {
        $("#progressText").text(text + " (" + progress + "%)");
    }
}

function windowResized() {
    const newWidth = windowWidth * 0.5,
          newHeight = windowHeight * 0.5;
    console.log({
        newWidth: newWidth,
        newHeight: newHeight,
        width: width,
        height: height,
        scale: globalScale
    });

    globalScale = newWidth / (width / globalScale);
    //console.log(globalScale);
    resizeCanvas(newWidth, newHeight, true);

    const newX = width / 2;
    const newY = height / 2;
    offsetX += newX - x;
    offsetY += newY - y;
    x = newX;
    y = newY;
    redrawActiveDrawings(false);
}

async function smoothProgress(ticks, text, delay = 25, initial = 67) {
    let count = 0;
    while (count++ < ticks) {
        updateProgress(initial + round(33 * count / ticks) , text);
        await sleep(delay);
    }
}

function toggleList() {
    $("#expandableList").toggleClass("expanded");
    if ($("#modelBtn").attr("value") == 1) {
        $("#modelBtn").text("Hide Models"); 
        $("#modelBtn").attr("value", 0);
    } else {
        $("#modelBtn").text("View Available Models");
        $("#modelBtn").attr("value", 1);
    }

}
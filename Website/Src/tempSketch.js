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


function setup() {
    canvas = createCanvas(windowWidth * cwidthRatio, windowHeight * cheightRatio);
    // canvas = createCanvas(1000, 500);
    background(255);
    x = width / 2;
    y = height / 2;
    console.log(x,y)
    setXY(x,y);
}
function draw() {
       if(readyCount === objectCount && aligned === false && activeDrawings.length > 0){
           alignObjects();
           console.log(activeDrawings.length);
           aligned = true;
       }
}
function startDrawing(objects){
    console.log(objects);
    objectCount = objects.length;
    objects.map(object => {
        activeDrawings.push({drawing: new Drawing(x,y,object.name,globalScale),position:object.position, status:false})
    })
    activeDrawings.map(activedrawing =>{
        activedrawing.drawing.generate((boundingbox)=>{
            activedrawing.boundingbox = boundingbox;
            activedrawing.status = true;
            readyCount++;
        })
    })
    //Wait Function

    // drawObjects = objects;
    // const cInd = objects.findIndex((obj)=>obj.position == "centre");
    // mainObject = new Drawing(x,y,objects[cInd].name,globalScale);
    // mainObject.generate(finishedMainObject);
    // for (let i = 0; i < objects.length; i++) { 
    //     if(i != cInd)
    //         unmainObjects.push({drawing: new Drawing(x,y,objects[i].name,globalScale),position:objects[i].position, status:false});    
    // }

}

async function alignObjects(){
    console.log(activeDrawings.length);
    for (let i = activeDrawings.length - 2; i >=0 ; i--) {
        let element = activeDrawings[i];
        element.status = false;
        let objectBB = element.boundingbox;
        let relBB = activeDrawings[i+1].boundingbox;
        console.log(objectBB);
        console.log(relBB);

        var input = [
            relBB.x/300,
            relBB.y/300,
            relBB.height/100,
            relBB.width/100,
            objectBB.height/100,
            objectBB.width/100,
            element.position
        ]
        
        let position = await placeObject(input);
        element.drawing.setX(position.y);
        element.drawing.setY(position.x);
        let boundingBox = await element.drawing.generate();
        element.boundingbox = boundingBox;
    }
    drawActiveDrawings();
}

function drawActiveDrawings() {
    activeDrawings.map(element => {
        clampScale(element.drawing);
        element.drawing.draw(true);
    })
}

function finishedMainObject(boundingBox){
    mainObject.draw(true);
    mainBoundingBox = boundingBox;
    console.log(mainBoundingBox);
    unmainObjects.forEach(obj => {
        obj.drawing.generate((boundingbox)=>{
            var input = [
                mainBoundingBox.x,
                mainBoundingBox.y,
                mainBoundingBox.height,
                mainBoundingBox.width,
                boundingbox.height,
                boundingbox.width,
                obj.position
            ]
            console.log(input);
            placeObject(input, (position)=>{
                obj.drawing.setX(position.x);
                obj.drawing.setY(position.y);
                obj.drawing.generate(()=>{
                    obj.drawing.draw(true);
                })
            });
        });
    });
}
function generatePosition(){
    return position
}
function onPredicted(resp){
    
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

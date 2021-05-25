const DiscOptions = {
    task:'classification'
}
var discLoaded = false;
var genLoaded = false;
var DiscModel = ml5.neuralNetwork(DiscOptions);
var xX = 10; var yY = 10;


LoadModelDisc();
//let disc;
function LoadModelDisc() {
    DiscModel.load("Models/model.json", () => {
        console.log("Model loaded");
    });
}

function setXY(X, Y) {
    xX = X;
    yY = Y;    
}

async function callGenModel(input){
    return new Promise(resolve =>{
        console.log("Hello");
        let xml = new XMLHttpRequest();
        xml.open("POST", "/predict", true);
        xml.setRequestHeader("Content-Type", "application/json");
        xml.send(JSON.stringify({input:input}));
        xml.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200){
                console.log(this.responseText);
                let result = JSON.parse(this.responseText);
                return resolve(result);
            }
        }
    })
    
}
async function placeObject(input, callback = null) {
    return new Promise(async (resolve) =>{
        let result;
        let position = null;
        position = await callGenModel(input);
        //console.log(position);
        var discInput = {
            main_x: input[0],
            main_y:input[1],
            main_height:input[2],
            main_width:input[3],
            shape_height:input[4],
            shape_width:input[5],
            shape_x:position.x,
            shape_y:position.y,
        }
        result = await DiscModel.classify(discInput);
        console.log(result[0].label)
        console.log(input[6]);
        // console.log("Xdiff: ",(discInput.main_x - discInput.shape_x)*xX)
        // console.log("Ydiff: ",(discInput.main_y - discInput.shape_y)*yY)
        position.x = position.x * xX
        position.y = position.y * yY
        console.log(position);
        console.log([input[0]* xX, input[1] * yY])
        return resolve(position);
    })
}

function loadGenModel(){
    //request to load and verify if loaded
    let xml = new XMLHttpRequest();
    xml.open("POST","/loadModel",false);
    xml.setRequestHeader("Content-Type","application/json");
    xml.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            if(this.responseText == "Loaded"){
                console.log("Generator Model Loaded");
            }else{
                console.log("Generator Model Not Loaded");
            }
        }
    }
}
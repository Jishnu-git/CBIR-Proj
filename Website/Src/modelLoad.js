const DiscOptions = {
    task:'classification'
}
var discLoaded = false;
var genLoaded = false;
var DiscModel = ml5.neuralNetwork(DiscOptions);

LoadModelDisc();
//let disc;
function LoadModelDisc() {
    DiscModel.load("Models/model.json", () => {
        console.log("Model loaded");
    });
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
        let count = 0;
        do {
            count++;
            position = await callGenModel(input);
            console.log(position);
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
            // var discInput = {
            //     main_x: input[0],
            //     main_y:input[1],
            //     main_height:input[2],
            //     main_width:input[3],
            //     shape_height:input[4],
            //     shape_width:input[5],
            //     shape_x:position.x,
            //     shape_y:position.y,
            // }
            // result = await DiscModel.classify(discInput);
        }while(result[0].label !== input[6] && count < 3)
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
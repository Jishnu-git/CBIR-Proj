const DiscOptions = {
    task:'classification'
}
var discLoaded = false;
var genLoaded = false;
var DiscModel = ml5.neuralNetwork(options);

function placeObject(input, callback){
    let xml = new XMLHttpRequest();
    xml.open("POST", "/predict", true);
    xml.setRequestHeader("Content-Type", "application/json");
    xml.send(JSON.stringify({input:input}));
    xml.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
            //callback(this.responseText);
        }
    }
}

function loadModel(){
    const DiscOptions = {
        model: 'Models/Position_Discriminator.json',
        metadata: 'Models/Position_Discriminator_meta.json',
        weights: 'Models/Position_Discriminator.weights.bin'
      }
    DiscModel.load(DiscOptions,onDiscLoad);
    loadGenModel();
}

function onDiscLoad(){
    console.log("Discriminator Loaded");
    discLoaded = true;
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
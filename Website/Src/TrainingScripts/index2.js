
var test;
var nn;
var split_ratio = 0.25;
var iteration = 0;
var train;
async function onTrainingFinish(){
    var resultArray = []
    shuffleArray(data);
    let test_data = data.slice(4000, 6000);
    for (let i = 0; i < test_data.length; i++) {
        const element = test_data[i];
        input = {
            main_x: element.main_x/300,
            main_y:element.main_y/300,
            main_height:element.main_height/100,
            main_width:element.main_width/100,
            shape_height:element.shape_height/100,
            shape_width:element.shape_width/100,
            shape_x:element.shape_x/420,
            shape_y:element.shape_y/420
        }
        resultArray.push(nn.classify(input));                
    }
    await Promise.all(resultArray).then((values)=>{
        console.log("Training Result")
        var count =0;
        for (let i = 0; i < values.length; i++) {
            const element = values[i][0].label;
            const position = test_data[i].position;
            if(position === element) {
                count++;
            }            
        }
        console.log(count/2000);
        iteration++;
        training();
    })
    .catch(err => console.log(err))        
}

function addData(iteration) {
    if(iteration !== 0) {
        for (let i = 0; i < data.length * split_ratio * iteration; i++) {
            const element = data[i];
            let input = {
                main_x: element.main_x/300,
                main_y:element.main_y/300,
                main_height:element.main_height/100,
                main_width:element.main_width/100,
                shape_height:element.shape_height/100,
                shape_width:element.shape_width/100,
                shape_x:element.shape_x/420,
                shape_y:element.shape_y/420
            }
            let output = {
                position:element.position
            }
            nn.addData(input, output);    
        }
    }
    console.log("Adding Data");
    let startIndex = data.length * split_ratio * iteration + 1;
    for (let i = startIndex; i < data.length; i++) {
        const element = data[i];
        let input = {
            main_x: element.main_x/300,
            main_y:element.main_y/300,
            main_height:element.main_height/100,
            main_width:element.main_width/100,
            shape_height:element.shape_height/100,
            shape_width:element.shape_width/100,
            shape_x:element.shape_x/420,
            shape_y:element.shape_y/420
        }
        let output = {
            position:element.position
        }
        nn.addData(input, output);
    }
}
function setup(){
    stroke(0);
    strokeWeight(3);
    canvas = createCanvas(windowWidth *0.25 , windowHeight *0.25);
    background(255);
    let options = {
        task:'classification',
        debug: false
    }
    nn = ml5.neuralNetwork(options);
    training();
}
function training(){
    if(iteration < 4) {
        shuffleArray(data);
        var trainOptions = {
            epochs: 50,
            shuffle:true,
            validationSplit:0.1
        }
        addData(iteration);
        nn.train(trainOptions,onTrainingFinish);
    } else {
        console.log("Finished all iterations");
        nn.save();
    }
}
function afterSave(){
    console.log("Model Saved Successfully");
    console.log("Iteration: "+iteration);
}

function shuffleArray(array){
    array.sort(() => Math.random() - 0.5);
}
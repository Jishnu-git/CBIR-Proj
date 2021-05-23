var nn = new NNDiscriminator(false);
var test;
var split_ratio = 0.25;
var iteration = 1;
var train;
async function onTrainingFinish(){
    var resultArray = []
    for (let i = 0; i < test.length; i++) {
        const element = test[i];
        input = {
            main_height:element.main_height,
            main_width:element.main_width,
            main_x: element.main_x,
            main_y:element.main_y,
            shape_height:element.shape_height,
            shape_width:element.shape_width,
            shape_x:element.shape_x,
            shape_y:element.shape_y
        }
        resultArray.push(nn.testModel(input));                
    }
    await Promise.all(resultArray).then((values)=>{
        console.log("Training Result")
        var count =0;
        for (let i = 0; i < values.length; i++) {
            const element = values[i][0].label;
            const position = test[i].position;
            if(position === element) {
                count++;
            }            
        }
        console.log(count/300);
        nn.nextIteration();
        training(++iteration);
    })
    .catch(err => console.log(err))
}
function addData() {
    for (let i = 0; i < train.length; i++) {
        const element = train[i];
        input = {
            main_height:element.main_height,
            main_width:element.main_width,
            main_x: element.main_x,
            main_y:element.main_y,
            shape_height:element.shape_height,
            shape_width:element.shape_width,
            shape_x:element.shape_x,
            shape_y:element.shape_y
        }
        output = {
            position:element.position
        }
        nn.feedData(input,output);
    }
}
function setup(){
    stroke(0);
    strokeWeight(3);
    canvas = createCanvas(windowWidth *0.25 , windowHeight *0.25);
    background(255);
    training(1);
}
function training(iteration){
    
    if(iteration * split_ratio > 1){
        console.log("Finished all iterations");
        nn.saveNN(afterSave);
        return;
    }

    var dataset = nn.split_train_data(data,split_ratio);
    test = dataset[0];
    train = dataset[1];
    addData();
    var trainOptions = {
        epochs: 50
    }
    nn.trainModel(trainOptions, onTrainingFinish);
}
function afterSave(){
    console.log("Model Saved Successfully");
    console.log("Iteration: "+iteration);
}
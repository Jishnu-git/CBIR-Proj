var nn = new NNDiscriminator(false);
var test;
var split_ratio = 0.25;
var iteration = 1;
var train;
async function onTrainingFinish(){
    var resultArray = []
    // console.log(test.length);
    // console.log(train.length);
    // for (let i = 0; i < test.length; i++) {
    //     const element = test[i];
    //     input = {
    //         main_height:element.main_height,
    //         main_width:element.main_width,
    //         main_x: element.main_x,
    //         main_y:element.main_y,
    //         shape_height:element.shape_height,
    //         shape_width:element.shape_width,
    //         shape_x:element.shape_x,
    //         shape_y:element.shape_y
    //     }
    //     resultArray.push(nn.testModel(input));                
    // }
    // await Promise.all(resultArray).then((values)=>{
    //     console.log("Training Result")
    //     var count =0;
    //     for (let i = 0; i < values.length; i++) {
    //         const element = values[i][0].label;
    //         const position = test[i].position;
    //         if(position === element) {
    //             count++;
    //         }            
    //     }
    //     console.log(count/300);
    //     nn.nextIteration();
    //     training(++iteration);
    // })
    // .catch(err => console.log(err))
    shuffleArray(data);
    let test_data = data.slice(4000, 6000);
    for (let i = 0; i < test_data.length; i++) {
        const element = test_data[i];
        input = {
            main_height:element.main_height/300,
            main_width:element.main_width/300,
            main_x: element.main_x/100,
            main_y:element.main_y/100,
            shape_height:element.shape_height/100,
            shape_width:element.shape_width/100,
            shape_x:element.shape_x/420,
            shape_y:element.shape_y/420
        }
        resultArray.push(nn.testModel(input));                
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
        nn.saveNN(afterSave);
        // nn.nextIteration();
        // training(++iteration);
    })
    .catch(err => console.log(err))        
}

function addData() {
    let train = data;
    console.log("Adding Data");
    for (let i = 0; i < train.length; i++) {
        const element = train[i];
        input = {
            main_height:element.main_height/300,
            main_width:element.main_width/300,
            main_x: element.main_x/100,
            main_y:element.main_y/100,
            shape_height:element.shape_height/100,
            shape_width:element.shape_width/100,
            shape_x:element.shape_x/420,
            shape_y:element.shape_y/420
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
function training(){
    // console.log("trainging iteration", iteration);
    // if(iteration * split_ratio > 1){
    //     console.log("Finished all iterations");
    //     nn.saveNN(afterSave);
    //     return;
    // }
    shuffleArray(data);
    // var dataset = nn.split_train_data(data,split_ratio);
    // test = dataset[0];
    // train = dataset[1];
    addData();
    var trainOptions = {
        epochs: 50,
        shuffle:true,
        validationSplit:0.1

    }
    nn.trainModel(trainOptions, onTrainingFinish);
}
function afterSave(){
    console.log("Model Saved Successfully");
    console.log("Iteration: "+iteration);
}

function shuffleArray(array){
    array.sort(() => Math.random() - 0.5);
}
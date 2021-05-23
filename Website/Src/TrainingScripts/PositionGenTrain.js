var main_shape = []
var place_shape = []
var input = []
var output = []
const model = tf.sequential();

plotData();
modelInit();

//Extract Data from dataset
extractData();

//Create Tensors out of data extracted
const xs = tf.tensor2d(input, [input.length, input[0].length]);
const ys = tf.tensor2d(output, [output.length, output[0].length]);

modelTrain();

function plotData(){
    for (let i = 0; i < data.length; i++) {
        main_shape.push({x:data[i].main_x, y:data[i].main_y})
        place_shape.push({x:data[i].shape_x, y:data[i].shape_y})
    }
    console.log(data);
    //Scatterplot for coordinate data
    tfvis.render.scatterplot(
        {name:"Positions"},
        {values : [main_shape,place_shape]}
    )
}

function modelInit(){
    // Define a model for linear regression.
    model.add(tf.layers.dense({units: 16, inputShape: [10]}));
    model.add(tf.layers.dense({units: 2}));
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
    console.log(model.summary())

}

function modelTrain(){
    // Train the model using the data.
    model.fit(xs, ys, {epochs: 50, validationSplit: 0.25, shuffle:true}).then((info) => {
        console.log(info);
        var test_dataX = tf.tensor2d(input, [input.length, input[0].length]);
        const pred = model.predict(test_dataX);
        var predicted = pred.arraySync();
        var count = 0;
        var error = 0;
        predicted.forEach(pred_value => {
            xDiff = (output[count][0] - pred_value[0])*320;
            yDiff = (output[count++][1] - pred_value[1])*320;
            error += Math.sqrt(xDiff**2 + yDiff**2); 
        });
        console.log(error/predicted.length);
        model.save('downloads://PosititionGeneration');
    // Open the browser devtools to see the output
    });
}

function onTrainEnd(){
    console.log("Training Finished");
}

function onEpochEnd(epoch, logs){
    console.log(epoch, logs)
}

function extractData(){
    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        hotencode = oneHotEncode(element.position);
        //Create Input and Output Arrays from Dataset

        input.push([element.main_x / 300,
            element.main_y / 300,
            element.main_height/100,
            element.main_width/100,
            element.shape_height/100,
            element.shape_width/100,
            hotencode
        ].flat());
        output.push([element.shape_x/320, element.shape_y/320])//,element.shape_y]);        
    }
}

function oneHotEncode(position){
        //One Hot Encoding Directions 
        let topBit = 0; // 0 for inactive 1 for active
        let bottomBit = 0;
        let leftBit = 0;
        let rightBit = 0;

        switch(position){
            case'top left':
                topBit = 1;
                leftBit = 1;
                break;
            case'top right':
                topBit = 1;
                rightBit = 1;
                break;
            case'top':
                topBit = 1;
                break;
            case'bottom':
                bottomBit = 1;
                break;
            case'right':
                rightBit = 1;
                break;
            case'left':
                leftBit = 1;
                break;
            case'bottom left':
                bottomBit = 1;
                leftBit = 1;
                break;
            case'bottom right':
                bottomBit = 1;
                rightBit = 1;
                break;
            default:
                console.error("Incorrect Position");
                return;
        }
    return [topBit, bottomBit, leftBit, rightBit];
}
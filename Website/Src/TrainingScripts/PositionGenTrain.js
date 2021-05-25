var main_shape = []
var place_shape = []
var input = []
var output = []
const model = tf.sequential();
let iteration = 0
let splitRatio = 0.25
let xs;
let ys;
plotData();
modelInit();

training()
async function training() {
    while(iteration < 4) {
        input = []
        output = []
        console.log(iteration);
        //Extract Data from dataset
        extractData(splitRatio, iteration);
    
        //Create Tensors out of data extracted
        xs = tf.tensor2d(input, [input.length, input[0].length]);
        ys = tf.tensor2d(output, [output.length, output[0].length]);
    
        let result = await model.fit(xs, ys, {epochs: 50, validationSplit: 0.1, shuffle:true});
        console.log(result);
        // result.then((info) => {
        //     console.log(info);
        //     var test_dataX = tf.tensor2d(input, [input.length, input[0].length]);
        //     const pred = model.predict(test_dataX);
        //     var predicted = pred.arraySync();
        //     var count = 0;
        //     var error = 0;
        //     predicted.forEach(pred_value => {
        //         xDiff = (output[count][0] - pred_value[0])*420;
        //         yDiff = (output[count++][1] - pred_value[1])*420;
        //         error += Math.sqrt(xDiff**2 + yDiff**2); 
        //     });
        //     console.log(error/predicted.length);
        // });
        iteration++;

    }
    model.save('downloads://PosititionGeneration');
}

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
    model.add(tf.layers.dense({units: 28, inputShape: [10]}));
    model.add(tf.layers.leakyReLU());
    model.add(tf.layers.dropout(0.25))
    model.add(tf.layers.dense({units: 54}));
    model.add(tf.layers.leakyReLU());
    model.add(tf.layers.dropout(0.25))
    model.add(tf.layers.dense({units: 28}));
    model.add(tf.layers.leakyReLU());
    model.add(tf.layers.dropout(0.25))
    model.add(tf.layers.dense({units: 2}, activation="sigmoid"));
    model.compile({loss: 'meanSquaredError', optimizer: 'adam'});
    console.log(model.summary())

}

// async function modelTrain(){
//     // Train the model using the data.
//     return await model.fit(xs, ys, {epochs: 50, validationSplit: 0.1, shuffle:true})
//         model.save('downloads://PosititionGeneration');
//     // Open the browser devtools to see the output
// }

function onTrainEnd(){
    console.log("Training Finished");
}

function onEpochEnd(epoch, logs){
    console.log(epoch, logs)
}

function extractData(splitRatio, iteration){
    if(iteration !== 0) {
        for (let i = 0; i < data.length * splitRatio * iteration; i++) {
            const element = data[i];
            hotencode = oneHotEncode(element.position);
            //Create Input and Output Arrays from Dataset

            input.push([element.main_x/300,
                element.main_y/300,
                element.main_height/100,
                element.main_width/100,
                element.shape_height/100,
                element.shape_width/100,
                hotencode
            ].flat());
            output.push([element.shape_x/300, element.shape_y/300])   
        }
    }
    let startIndex = data.length * splitRatio * iteration+1 
    for (let i = startIndex; i < data.length; i++) {
        const element = data[i];

        hotencode = oneHotEncode(element.position);
        //Create Input and Output Arrays from Dataset

        input.push([element.main_x/300,
            element.main_y/300,
            element.main_height/100,
            element.main_width/100,
            element.shape_height/100,
            element.shape_width/100,
            hotencode
        ].flat());
        output.push([element.shape_x/300, element.shape_y/300])//,element.shape_y]);        
    }
}

function oneHotEncode(position){
        //One hot encoding directions
        let top = 0; 
        // 0 for inactive 1 for active
        let bottom = 0;
        let left = 0;
        let right = 0;
        // let topRight = 0;
        // let bottomRight = 0;
        // let topLeft = 0;
        // let bottomLeft = 0;
    
        switch(position){
            // case'top left':
            //     topLeft = 1
            //     break;
            // case'top right':
            //     topRight = 1;
            //     break;
            case'top':
                top = 1;
                break;
            case'bottom':
                bottom = 1;
                break;
            case'right':
                right = 1;
                break;
            case'left':
                left = 1;
                break;
            // case'bottom left':
            //     bottomLeft = 1
            //     break;
            // case'bottom right':
            //     bottomRight = 1
            //     break;
            default:
                console.error("Incorrect Position");
                return;
        }
    return [top, bottom, right, left]// topLeft, topRight, bottomLeft, bottomRight];
}
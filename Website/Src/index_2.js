let x_1 = 0;
let y_1 = 0;
let height_1 = 55;
let height_2 = 55;
let width_1 = 55;
let width_2 = 55;
let x_2 = 100;
let y_2 = 100;
let correct = 0;
let options;

let nn;
function setup() {
    stroke(0);
    strokeWeight(3);
    canvas = createCanvas(windowWidth *0.25 , windowHeight *0.25);
    background(255);
    options = {
      task:'classification',
      debug: 'true',
      layers:[
        {
          type: 'dense',
          units: 16,
          activation: 'relu',
        },
        {
          type: 'dense',
          units: 16,
          activation: 'relu',
        },
        {
          type: 'dense',
          activation: 'softmax',
        },
      ],
    }
    nn = ml5.neuralNetwork(options);
    count = 0;
    for(var i=0;i<701;i++){
      const input ={
        'main_x':data[i].main_x,
        'main_y':data[i].main_y,
        'main_height':data[i].main_height,
        'main_width':data[i].main_width,
        'shape_height':data[i].shape_height,
        'shape_width':data[i].shape_width,
        'shape_x':data[i].shape_x,
        'shape_y':data[i].shape_y 
      };
      const output ={
        'position' : data[i].position
      };
      nn.addData(input,output);
      count++;  
    }
    nn.normalizeData();
    const trainOptions ={
      epochs: 100
    }
    nn.train(trainOptions, whileTraining, finishedTraining);
  }
let trained = false;
function draw(){
  background(255)
    rect(x_1, y_1, width_1, height_1);
    rect(x_2, y_2, width_2, height_2);
    if(classified.length == 299 && !trained){
      findAccuracy();
      trained = true;
    }
}

function findAccuracy(){
  count = 0;
  console.log("Finding Accuracy");
  for (let i = 0; i < classified.length; i++) {
    if (data[i].position === classified[i].label)
      count++;
    else
      console.log(data[i].position, classified[i].label);
  }
  document.getElementById("result-area").innerText = count/299;
}

function whileTraining(epoch, loss){
  console.log(epoch);
}

function finishedTraining(){
  console.log("finished training");
  testData();
}

function setRectHeight(value, obj){
  switch(obj){
    case 1: height_1 = parseInt(value);
    break;
    case 2: height_2 = parseInt(value);
    break;
  }
  redraw();
}
function setRectWidth(value, obj){
  switch(obj){
    case 1: width_1 = parseInt(value);
    break;
    case 2: width_2 = parseInt(value);
    break;
  }
  redraw();
}
function setXoffset(value,obj){
  switch(obj){
    case 1: x_1 = parseInt(value);
    break;
    case 2: x_2 = parseInt(value);
    break;
  }
  redraw();
}
function setYoffset(value,obj){
  switch(obj){
    case 1: y_1 = parseInt(value);
    break;
    case 2: y_2 = parseInt(value);
    break;
  }
  redraw();
}
let classified = []
function testData(){
  console.log("Testing data");
  let input = []
  for (let i = 701; i < data.length; i++) {
    input = {
      'main_x':data[i].main_x,
      'main_y':data[i].main_y,
      'main_height':data[i].main_height,
      'main_width':data[i].main_width,
      'shape_height':data[i].shape_height,
      'shape_width':data[i].shape_width,
      'shape_x':data[i].shape_x,
      'shape_y':data[i].shape_y 
    };
    nn.classify(input,handleResult);
  }
}

function pred(){
      const input ={
        'main_x':x_1,
        'main_y':y_1,
        'main_height':height_1,
        'main_width':width_1,
        'shape_height':height_2,
        'shape_width':width_2,
        'shape_x':x_2,
        'shape_y':y_2 
      };
      nn.classify(input,handleResult);
}
function handleResult(error, result){
  if(!error){
    classified.push(result[0].label);
    //console.log(result);
  }else{
    console.error(error);
    return;
  }
}

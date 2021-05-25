class NNDiscriminator{

  constructor(){
    this.options = {
      task:'classification',
      debug: false
    }
    this.model = ml5.neuralNetwork(this.options);
    this.iteration = 0;
  }

  feedData(input, output){
    this.model.addData(input,output);
  }

  async trainModel(trainingOptions, finishedCallback = this.finishedTraining,whileTrainingCallback = this.whileTraining,){
    if(trainingOptions === null){
      console.log("Training Options not specified");
      return;
    }
    this.model.normalizeData();
    let result = await this.model.train(trainingOptions);
    return result;
  }

  whileTraining(epoch, loss){
    //console.log("Epoch: "+epoch + "Loss: "+loss);
  }

  finishedTraining(){
    console.log("Finished Training");
  }

  testModel(testInput, testResultCallback = null){
    if(testResultCallback === null)
      return this.model.classify(testInput);
    else
      this.model.classify(testInput,testResultCallback);
  }

  testMultiple(testInput, testResultCallback){
    this.model.classifyMultiple(testInput, testResultCallback);
  }
  split_train_data(data,i){
    var train_quant = i * data.length;
    var test = data.slice(train_quant*this.iteration, train_quant*(this.iteration + 1));
    var train = data.slice(0,train_quant*this.iteration).concat(data.slice(train_quant*(this.iteration + 1)));
    return [test, train];
  }
  nextIteration(){
    this.iteration++;
  }
  saveNN(afterSave){
    this.model.save().then(afterSave());
  }
}
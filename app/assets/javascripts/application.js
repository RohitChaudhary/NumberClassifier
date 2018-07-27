// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require activestorage
//= require turbolinks
//= require_tree .


var context;
var canvas;
var pressed;
var oldX, oldY;
const model = tf.sequential();

function init() {
  console.log("init");
  canvas = document.getElementById('inputCanvas');
  context = canvas.getContext("2d");

  canvas.addEventListener("mousedown", function (element) {
    pressed = true;
    draw(element.pageX - canvas.offsetLeft, element.pageY - canvas.offsetTop,
    false);
  }, false);

  canvas.addEventListener("mousemove", function (element) {
    if (pressed) {
      draw(element.pageX - canvas.offsetLeft, element.pageY - canvas.offsetTop,
      true);
    }
  }, false);

  canvas.addEventListener("mouseup", function (element) {
    pressed = false;
  }, false);

  canvas.addEventListener("mouseleave", function (element) {
    pressed = false;
  }, false);

  document.getElementById('submitButton').addEventListener("click", submit);
  //document.getElementById('submitButton').disabled = true;
  document.getElementById('trainButton').addEventListener("click", startTraining);
  document.getElementById('clearButton').addEventListener("click", clear);
}

function draw(x, y, isPressed) {
  if (isPressed) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = "32";
    context.lineJoin = "round";
    context.moveTo(oldX, oldY);
    context.lineTo(x, y);
    context.closePath();
    context.stroke();
  }
  oldX = x;
  oldY = y;
}

function clear() {
  console.log("clearing board");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function submit() {
  var imgData = context.getImageData(0,0,448,448);
  var grayImage = new Array(200704)
  for (var i = 0; i < imgData.data.length; i += 4) {
    //var avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    //grayImage[i/4] = avg/255.0;
      grayImage[i/4] = (255 - imgData.data[i + 3])
  }
  //console.log(grayImage)
  imageTensor = tf.image.resizeBilinear(tf.tensor(grayImage).reshape([-1, 448, 448, 1]), [28, 28]);
  //console.log(imageTensor.print());
  tf.tidy(() => {
    const output = model.predict(imageTensor);

    const axis = 1;
    console.log(output.print());
    console.log(output.argMax(axis).dataSync());
  });
}


// Much of the following code is implemented using google's tensflow guides.
// https://js.tensorflow.org/tutorials/mnist.html

async function startTraining() {
  console.log("train");
  await load();
  await train();
  console.log("training complete");
  document.getElementById('submitButton').disabled = false;
}

async function train() {
  console.log("model creation");

  model.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'VarianceScaling'
  }));

  model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
  }));

  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'VarianceScaling'
  }));

  model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
  }));

  model.add(tf.layers.flatten());

  model.add(tf.layers.dense({
    units: 10,
    kernelInitializer: 'VarianceScaling',
    activation: 'softmax'
  }));

  const LEARNING_RATE = 0.15;
  const optimizer = tf.train.sgd(LEARNING_RATE);

  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  await trainCompute(model);
}

async function trainCompute(model) {
  console.log("training computations");

  const BATCH_SIZE = 64;
  const TRAIN_BATCHES = 150;

  const TEST_BATCH_SIZE = 1000;
  const TEST_ITERATION_FREQUENCY = 5;

  const lossValues = [];
  const accuracyValues = [];

  for (let i = 0; i < TRAIN_BATCHES; i++) {
      const [batch, validationData] = tf.tidy(() => {
        const batch = data.nextTrainBatch(BATCH_SIZE);
        batch.xs = batch.xs.reshape([BATCH_SIZE, 28, 28, 1]);

        let validationData;
        if (i % TEST_ITERATION_FREQUENCY === 0) {
          const testBatch = data.nextTestBatch(TEST_BATCH_SIZE);
          validationData = [
            testBatch.xs.reshape([TEST_BATCH_SIZE, 28, 28, 1]), testBatch.labels
          ];
        }
        return [batch, validationData];
      });

      const history = await model.fit(
        batch.xs, batch.labels,
        {batchSize: BATCH_SIZE, validationData, epochs: 1});

      const loss = history.history.loss[0];
      const accuracy = history.history.acc[0];
    }
  }

let data;
async function load() {
  data = new MnistData();
  await data.load();
}

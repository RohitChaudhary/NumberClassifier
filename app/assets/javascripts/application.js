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

  document.getElementById('clearButton').addEventListener("click", clear);
}

function draw(x, y, isPressed) {
  if (isPressed) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = "8";
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

"use strict"

var W = 260;
var H = 220;
var TAU = Math.PI * 2;
var PICO = Math.PI / 2;
var center = { x : W / 2, y : H / 2 };

function $ (selector) {
  return document.querySelectorAll(selector);
}

function transform (element, points, labels) {
  var size, context;

  size = points.length;
  context = element.getContext('2d');

  context.lineWidth = 1;
  context.fillStyle = "rgba(0,0,0,0.3)";
  context.strokeStyle = "rgba(0,0,0,1)";

  points.forEach(function (_, i) {
    var angle, position;

    angle = getAngle(size, i);
    position = getCoordinates(angle, 75);

    drawAxis(context, position[0], position[1]);
  });

  points.forEach(function (_, i, a) {
    var angle, width, A, B;

    angle = getAngle(size, i);
    width = getWidth(a[i], 75);

    A = getCoordinates(angle, width);

    if (i === size - 1) {

      angle = getAngle(size, 0);
      width = getWidth(a[0], 75);

      B = getCoordinates(angle, width);

    } else {

      angle = getAngle(size, i + 1);
      width = getWidth(a[i + 1], 75);

      B = getCoordinates(angle, width);

    }

    drawShape(context, A, B);
  });

  context.fillStyle = "rgba(0,0,0,1)";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "normal 14px 'Montserrat', Arial, sans-serif";

  labels.forEach(function(label, i){
    var angle, position;

    angle = getAngle(size, i);
    position = getCoordinates(angle, 95);

    drawLabel(context, label, position);
  });

};

function getAngle (size, index) {
  return (TAU / size * index) - PICO;
}

function getWidth (value, max) {
  return value * max / 7;
}

function getCoordinates (angle, width) {
  var y = Math.sin(angle) * width;
  var x = Math.cos(angle) * width;

  return [x, y];
}

function drawAxis (context, x, y) {
  context.save();
  context.beginPath();

  context.translate(0.5, 0.5);

  context.moveTo(center.x, center.y);
  context.lineTo(center.x + x, center.y + y);
  context.stroke();

  context.restore();
}

function drawShape (context, A, B) {
  context.save();
  context.beginPath();

  context.translate(0.5, 0.5);

  context.moveTo(center.x, center.y);
  context.lineTo(center.x + A[0], center.y + A[1]);
  context.lineTo(center.x + B[0], center.y + B[1]);
  context.fill();

  context.restore();
}

function drawLabel (context, label, position) {
  context.save();

  context.translate(center.x + 0.5, center.y + 0.5);
  context.fillText(label, position[0], position[1]);

  context.restore();
}

/***************************************************/

Array.prototype.forEach.call($('canvas'), function (element) {
  if (element.dataset.points && element.dataset.labels) {
    console.log(element.dataset.labels)
    transform(element, JSON.parse(element.dataset.points), JSON.parse(element.dataset.labels));
  }
});

